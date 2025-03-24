<<<<<<< HEAD
import os
import faiss
from backend import globals
from fastapi import FastAPI
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from backend import recommendersystem
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
import json

connection_string = ""

client = AsyncIOMotorClient(connection_string)
database = client[]
recommendation_collection = database[]

INDEX_PATH = "./faiss.index"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

class Rating(BaseModel):
    rating: float

@app.post("/rate")
async def receive_rating(rating: Rating):
    print(f"Received rating: {rating.rating}")
    return {"message": "Rating received", "rating": rating.rating}

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


app.include_router(recommendersystem.router, prefix="/preferenceModal")