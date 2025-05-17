import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from database import engine
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

router = APIRouter()

def train_model():
    try:
        query = """
                SELECT *
                FROM LicentaDB.cartes
                WHERE CHAR_LENGTH(descriere) > 100
                AND isbn IS NOT NULL
                AND id < 49362
            """
        df = pd.read_sql_query(query, con=engine)
        df["tagged_description"] = df['isbn'].fillna('') + ' ' + df['descriere'].fillna('')
        df["tagged_description"].to_csv("tagged_description.txt", sep="\n", index=False, header=False)
        raw_data = TextLoader("tagged_description.txt").load()
        text_splitter = CharacterTextSplitter(chunk_size=0, chunk_overlap=0, separator="\n")
        documents = text_splitter.split_documents(raw_data)
        huggingface_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_books = Chroma.from_documents(documents, embedding=huggingface_embeddings)
        return vector_books
    Except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


