# pylint: skip-file
import os
from fastapi import FastAPI
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from backend import recommendersystem
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import auth, users
from backend.database import recommendation_collection
import faiss
import numpy as np
from backend import globals
import json
from backend.database import db

INDEX_PATH = "./faiss.index"

class Rating(BaseModel):
    rating: float

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.path.exists(INDEX_PATH):
        vectors = await getAllVectors()
        faiss_index = build_faiss_index(vectors)
        faiss.write_index(faiss_index, INDEX_PATH)

        with open("movie_ids.json", "w") as f:
            json.dump(globals.movieId_list, f)
    else:
        faiss_index = faiss.read_index(INDEX_PATH)
        with open("movie_ids.json", "r") as f:
            globals.movieId_list = json.load(f)
    yield

app = FastAPI(lifespan=lifespan)

async def getAllVectors():
    movie_dict = {}
    async for doc in recommendation_collection.find({}, {"cos_vector": 1, "movieId": 1}):
        movie_dict[doc["movieId"]] = doc["cos_vector"]

    globals.movieId_list = list(movie_dict.keys())
    vector_list = list(movie_dict.values())

    return np.array(vector_list, dtype=np.float32)

def build_faiss_index(np_vectors):
    d = np_vectors.shape[1]
    index = faiss.IndexFlatIP(d)
    index.add(np_vectors)

    return index

# Allow frontend (React) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3000/Search/238"],  # Allow frontend based on frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Load environment variables
load_dotenv()

# Include Routes
app.include_router(recommendersystem.router, prefix="/Recommendations")
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
