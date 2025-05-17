# app.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from apis import router
from utils import initialize_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Service starting")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    try:
        app.state.vector_store = Chroma(
            persist_directory="./chroma_db",
            embedding_function=embeddings
        )
        print("✅ Loaded existing Chroma DB")
        query = "Carti cu gen literar psihologic sau filozofic despre stoicism"
        docs = app.state.vector_store.similarity_search(query, k=10)
        print(docs)
    except:
        print("⚠️ No Chroma DB found - initializing new one")
        app.state.vector_store = initialize_vector_store()
        print("✅ Created new Chroma DB from dataset")
    yield
    print("Service closing")


FastApp = FastAPI(
    title="Book Recommender Service",
    lifespan=lifespan
)

FastApp.include_router(
    router,
    prefix="/api",
    tags=["books"]
)


