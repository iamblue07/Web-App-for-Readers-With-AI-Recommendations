'''
import asyncio
import numpy as np
from langchain_chroma import Chroma

from langchain_text_splitters import CharacterTextSplitter
from fastapi.concurrency import run_in_threadpool
from langchain.schema import Document
from langchain.vectorstores import Chroma
from tqdm.auto import tqdm
'''

from fastapi import FastAPI, Depends
import pandas as pd
'''
#import torch
'''
from sqlalchemy import text
from models import Utilizator
from sqlalchemy.orm import Session
from sqlalchemy import bindparam

from database import engine, SessionLocal, get_db

from dotenv import load_dotenv
load_dotenv()
emotion_labels = ["anger", "disgust", "fear", "joy", "sadness", "surprise", "neutral"]

from langchain.embeddings.openai import OpenAIEmbeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    #model_kwargs={'device': 'cuda'}
)

'''
#device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
async def query_and_translate(app:FastAPI):
    sql = """
            SELECT * FROM LicentaDB.cartes
            WHERE CHAR_LENGTH(descriere) > 100
              AND isbn IS NOT NULL
              AND id < 49362
              AND english_description IS NULL
        """
    df = await run_in_threadpool(
        pd.read_sql_query, sql, engine
    )
    translated_count = 0
    with SessionLocal() as session:
        for _, row in df.iterrows():
            try:
                translated = await translate_description(row["descriere"])
                session.execute(
                    text("""
                        UPDATE LicentaDB.cartes
                        SET english_description = :translated
                        WHERE id = :book_id
                    """),
                    {"translated": translated, "book_id": row["id"]}
                )
                session.commit()
                translated_count += 1

            except Exception as e:
                session.rollback()
                app.logger.error(f"Failed to translate book ID {row['id']}: {e}")
                continue

    return {"translated_count": translated_count}

async def query_books() -> pd.DataFrame:
    df = pd.read_sql_query(
        """
        SELECT * FROM LicentaDB.cartes
        WHERE CHAR_LENGTH(descriere) > 100
          AND isbn IS NOT NULL
          AND id < 49362
        """,
        con=engine
    )
    return df


from deep_translator import GoogleTranslator
import re
translator = GoogleTranslator(source='ro', target='en')
async def translate_description(desc: str) -> str:
    chunk_size = 5000
    try:
        chunks = re.split(r'(?<=[.!?])\s+', desc)
        translated_chunks = []
        current_chunk = ""
        for chunk in chunks:
            if len(current_chunk) + len(chunk) < chunk_size:
                current_chunk += chunk + " "
            else:
                translated = translator.translate(current_chunk.strip())
                translated_chunks.append(translated)
                current_chunk = chunk + " "

        if current_chunk:
            translated = translator.translate(current_chunk.strip())
            translated_chunks.append(translated)

        return " ".join(translated_chunks)
    except Exception as e:
        print(f"Translation error: {e}")
        return desc

from transformers import pipeline
classifier = pipeline("text-classification",
                        model = "j-hartmann/emotion-english-distilroberta-base",
                        top_k = None,
                        device = 0,
                        truncation=True, max_length=512)



async def start_sentiment_analysis(app: FastAPI):
    df = await query_books()
    df_scores = await sentiment_extraction(df)
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, update_emotion_scores, df_scores)
    print(f"Updated {len(df_scores)} rows with emotion scores.")


async def sentiment_extraction(df: pd.DataFrame) -> pd.DataFrame:
    results = []
    for _, row in tqdm(df.iterrows(), total=len(df)):
        desc = row["english_description"] or ""
        sentences = re.split(r'(?<=[.!?])\s+', desc)
        preds = classifier(sentences)
        max_scores = calculate_max_emotion_score(preds)
        max_scores.update({"id": int(row["id"]), "isbn": row["isbn"]})
        results.append(max_scores)
    return pd.DataFrame(results)

def calculate_max_emotion_score(predictions):
    per_emotion_scores = {label: [] for label in emotion_labels}
    for sent_pred in predictions:
        sorted_preds = sorted(sent_pred, key=lambda x: x["label"])
        for idx, label in enumerate(emotion_labels):
            per_emotion_scores[label].append(sorted_preds[idx]["score"])
    return {label: float(np.max(scores)) for label, scores in per_emotion_scores.items()}

def update_emotion_scores(df_scores: pd.DataFrame):
    sql = text("""
        UPDATE LicentaDB.cartes
        SET
          anger_score    = :anger,
          disgust_score  = :disgust,
          fear_score     = :fear,
          joy_score      = :joy,
          sadness_score  = :sadness,
          surprise_score = :surprise,
          neutral_score  = :neutral
        WHERE id = :id
    """)
    records = df_scores.to_dict(orient="records")

    with engine.begin() as conn:
        conn.execute(sql, records)




text_splitter = CharacterTextSplitter(chunk_size=0, chunk_overlap=0, separator="\n")


async def zero_shot_classification(app: FastAPI):
    df = await query_books()
    docs = [
        Document(page_content=row["descriere"], metadata={"isbn": row["isbn"]})
        for _, row in df.iterrows()
        if row.get("descriere")
    ]
    split_docs = text_splitter.split_documents(docs)
    store = Chroma(
        embedding_function=embeddings,
        persist_directory="./vectorstore"
    )
    for chunk in tqdm(split_docs, desc="Indexing text chunks", unit="chunk"):
        store.add_documents([chunk])
    store.persist()
    app.state.vector_store = store
'''

async def retrieve_semantic_recommendations\
                (app: FastAPI, query: str, top_k: int = 5, user_id: int = None, sentiment: str = None) \
        -> pd.DataFrame:
    valid_sentiments = ['anger','disgust','fear','joy','sadness','surprise','neutral']
    if sentiment not in valid_sentiments:
        raise ValueError(f"Invalid sentiment '{sentiment}'. Must be one of {valid_sentiments}")
    store = app.state.vector_store
    recs = store.similarity_search(query, k=50)
    ranked_isbns = [doc.metadata["isbn"] for doc in recs]
    sql = text("""
        SELECT * FROM LicentaDB.cartes
        WHERE isbn IN :isbns
    """).bindparams(bindparam('isbns', expanding=True))
    params = {"isbns": ranked_isbns}
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            conn.execute(
                text("DELETE FROM RecomandareAIs WHERE idUtilizator = :user_id"),
                {"user_id": user_id}
            )
            result = conn.execute(sql, params)
            rows = result.fetchall()
            cols = result.keys()
            df = pd.DataFrame(rows, columns=cols)
            sentiment_column = f"{sentiment}_score"
            df_sorted = df.sort_values(
                by=sentiment_column,
                ascending=False,
                na_position='last'
            )

            df_top = df_sorted.head(top_k).copy()
            top_isbns = df_top["isbn"].tolist()
            for _, row in df_top.iterrows():
                conn.execute(
                    text("""
                        INSERT INTO RecomandareAIs (idUtilizator, idCarte)
                        VALUES (:user_id, :carte_id)
                    """),
                    {"user_id": user_id, "carte_id": row["id"]}
                )
            trans.commit()
            df_top.reset_index(drop=True)
            return {"status": "Succes"}
        except Exception as e:
            trans.rollback()
            raise

async def verify_administrator(
                    user_id: int,
                    db: Session = Depends(get_db)) -> bool:
    try:
        db = SessionLocal()
        user = db.query(Utilizator) \
            .filter(Utilizator.id == user_id) \
            .first()

        return user.este_administrator if user else False
    except Exception as e:
        print(f"Database error checking admin status: {e}")
        return False
    finally:
        db.close()
