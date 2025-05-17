import asyncio
import re
import hashlib
from functools import lru_cache
import pandas as pd
import numpy as np
from tqdm import tqdm
import httpx
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import FastAPI
from langchain.schema import Document
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from database import engine
import torch

import os
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# CUDA & Torch optimizations
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.benchmark = True
torch.set_float32_matmul_precision('high')
torch._dynamo.disable()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Emotion classification model
tokenizer = AutoTokenizer.from_pretrained(
    "j-hartmann/emotion-english-distilroberta-base"
)
model = AutoModelForSequenceClassification.from_pretrained(
    "j-hartmann/emotion-english-distilroberta-base"
).to(device)
emotion_labels = ["anger", "disgust", "fear", "joy", "sadness", "surprise", "neutral"]

# Async HTTP client for translation
translator_client = httpx.AsyncClient(timeout=30)
GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"

# Simple in-memory cache for translations
@lru_cache(maxsize=100_000)
def cache_translate(text: str) -> str:
    res = httpx.get(
        GOOGLE_TRANSLATE_URL,
        params={
            'client': 'gtx',
            'sl': 'ro',
            'tl': 'en',
            'dt': 't',
            'q': text
        },
        timeout=10
    )
    # parse response
    # response format: [[["Translated","Original",...],..],...]
    data = res.json()[0]
    return ''.join(part[0] for part in data)

async def translate_texts(texts: list[str], max_batch_chars: int = 4000) -> list[str]:
    batches = []
    current = []
    count = 0
    for t in texts:
        if count + len(t) > max_batch_chars and current:
            batches.append(current)
            current = []
            count = 0
        current.append(t)
        count += len(t)
    if current:
        batches.append(current)

    translated = []
    for batch in batches:
        joined = "\n--SENT--\n".join(batch)
        # use cached sync function via executor
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, cache_translate, joined)
        translated.extend(result.split("\n--SENT--\n"))
    return translated


def clean_text(text: str) -> str:
    return (text.strip()
            .replace("ţ", "ț").replace("ş", "ș")
            .replace("Ţ", "Ț").replace("Ş", "Ș")
            .replace("â", "ă").replace("Â", "Ă"))


def extract_sentences(paragraph: str) -> list[str]:
    parts = re.split(r'(?<!\b\w)\.(?!\d)', paragraph)
    return [p.strip() for p in parts if len(p.strip()) >= 3]


def predict_emotions(texts: list[str], batch_size: int = 256) -> np.ndarray:
    all_probs = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        inputs = tokenizer(
            batch,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors='pt'
        ).to(device)
        with torch.inference_mode(), torch.amp.autocast("cuda"):
            logits = model(**inputs).logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
        all_probs.append(probs.cpu().numpy())
    return np.vstack(all_probs)

async def process_batch(descriptions: list[str]) -> np.ndarray:
    sentences = []
    idx_map = []
    for i, desc in enumerate(descriptions):
        text = clean_text(desc)
        for sent in extract_sentences(text):
            sentences.append(sent)
            idx_map.append(i)

    if not sentences:
        return np.zeros((len(descriptions), len(emotion_labels)), dtype=np.float32)

    translated = await translate_texts(sentences)
    filtered = [t for t in translated if any(c.isalpha() for c in t)]
    probs = predict_emotions(filtered)

    # aggregate max prob per description
    result = np.zeros((len(descriptions), len(emotion_labels)), dtype=np.float32)
    for src_idx, p in zip(idx_map, probs):
        result[src_idx] = np.maximum(result[src_idx], p)
    return result

async def load_books_and_emotions(app: FastAPI) -> pd.DataFrame:
    df = pd.read_sql_query(
        """
        SELECT * FROM LicentaDB.cartes
        WHERE CHAR_LENGTH(descriere) > 100
          AND isbn IS NOT NULL
          AND id < 49362
        """,
        con=engine
    )
    descs = df['descriere'].tolist()
    batch_size = 512
    emotions_list = []

    for i in tqdm(range(0, len(descs), batch_size), desc="Books", unit="batch"):
        batch = descs[i:i+batch_size]
        em = await process_batch(batch)
        emotions_list.append(em)

    all_em = np.vstack(emotions_list)
    for idx, label in enumerate(emotion_labels):
        df[label] = all_em[:, idx]
    df[emotion_labels] = df[emotion_labels].astype('float32')

    app.state.books_store = df
    return df

async def initialize_vector_store(app: FastAPI):
    df = await load_books_and_emotions(app)

    splitter = CharacterTextSplitter.from_huggingface_tokenizer(
        tokenizer, chunk_size=256, chunk_overlap=32
    )
    embed = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cuda'},
        encode_kwargs={'device': 'cuda', 'batch_size': 512, 'normalize_embeddings': True}
    )
    docs = [Document(page_content=clean_text(t)) for t in df['descriere']]
    splits = splitter.split_documents(docs)

    store = Chroma.from_documents(
        splits, embedding=embed,
        persist_directory="./chroma_db",
        collection_metadata={"hnsw:space": "cosine"}
    )
    app.state.vector_store = store
    return store