from contextlib import asynccontextmanager
import multiprocessing as mp
from fastapi.middleware.cors import CORSMiddleware

mp.set_start_method('spawn', force=True)
from fastapi import FastAPI
from apis import router
from langchain.vectorstores import Chroma
from utils import embeddings

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.vector_store = Chroma(
        persist_directory="./vectorstore",
        embedding_function=embeddings
    )
    yield

app = FastAPI(title="Book Recommender Service", lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["books"])


