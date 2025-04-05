import pandas as pd
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pickle
from surprise import SVD, Dataset, Reader
import json
from backend.database import recommendation_collection, users_collection
import numpy as np
import faiss
import os

async def main():
    
    MONGODB_URL = os.getenv("MONGODB_URL")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client["mydatabase"]

    # Fetch userId, movieId, rating
    cursor = recommendation_collection.find({}, {"userId": 1, "movieId": 1, "rating": 1, "_id": 0})
    docs = await cursor.to_list(length=None)
    df = pd.DataFrame(docs)

    # Force userId/movieId to be ints
    df["userId"] = df["userId"].astype(int)
    df["movieId"] = df["movieId"].astype(int)

    df.to_csv("ratings.csv", index=False)

    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['userId','movieId','rating']], reader)
    trainset = data.build_full_trainset()

    svd = SVD()
    svd.fit(trainset)

    with open("svd_model.pkl", "wb") as f:
        pickle.dump(svd, f)
    with open("trainset.pkl", "wb") as f:
        pickle.dump(trainset, f)

    print("SVD retraining complete and model updated.")

    # Build FAISS
    cursor2 = recommendation_collection.find({}, {"movieId": 1, "cos_vector": 1, "_id": 0})
    docs2 = await cursor2.to_list(length=None)
    movie_dict = {}
    for doc in docs2:
        movie_dict[doc["movieId"]] = doc["cos_vector"]

    movie_ids = list(movie_dict.keys())
    vectors = list(movie_dict.values())

    vectors_np = np.array(vectors, dtype=np.float32)
    d = vectors_np.shape[1]
    index = faiss.IndexFlatIP(d)
    index.add(vectors_np)
    faiss.write_index(index, "faiss.index")

    with open("movie_ids.json", "w") as f:
        json.dump(movie_ids, f)

    print("FAISS index and movie IDs updated.")

    # Update useCollaborativeFiltering
    cursor_users = users_collection.find({})
    docs_users = await cursor_users.to_list(length=None)
    for user_doc in docs_users:
        user_id = user_doc["_id"]
        ratings = user_doc.get("ratings", [])
        if len(ratings) > 5:
            await users_collection.update_one({"_id": user_id}, {"$set": {"useCollaborativeFiltering": True}})
        else:
            await users_collection.update_one({"_id": user_id}, {"$set": {"useCollaborativeFiltering": False}})
    print("User documents updated with collaborative filtering flags.")

if __name__ == "__main__":
    asyncio.run(main())
