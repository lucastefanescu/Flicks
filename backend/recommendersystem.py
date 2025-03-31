import faiss
from fastapi import APIRouter
from backend.database import users_collection
from backend.models import FormInfo, UserIdModel
from sklearn.preprocessing import normalize
import numpy as np
import backend.global_vars
from backend.training import main as training_main
import asyncio
from backend.training import main as training_main 

router = APIRouter()

mapping = {
    "Action": 0,
    "Adventure": 1,
    "Children": 2,
    "Comedy": 3,
    "Crime": 4,
    "Documentary": 5,
    "Drama": 6,
    "Fantasy": 7,
    "Film-Noir": 8,
    "Horror": 9,
    "IMAX": 10,
    "Musical": 11,
    "Mystery": 12,
    "Romance": 13,
    "Sci-Fi": 14,
    "Thriller": 15,
    "War": 16,
    "Western": 17,
}

@router.post("/retrain-svd")
async def retrain_svd():
    # Run the training code in the same event loop
    await training_main()
    return {"message": "SVD retraining complete"}

def compute_vector(genres: list, fav_movies: list, animated_movies: int, older_recent):
    form_vector = [0] * 20
    for g in genres:
        if g in mapping:
            form_vector[mapping[g]] += 1
    for fm in fav_movies:
        if fm in mapping:
            form_vector[mapping[fm]] += 1
    form_vector[18] = animated_movies
    form_vector[19] = older_recent
    form_np_vector = np.array(form_vector, dtype=np.float32).reshape(1, -1)
    form_np_vector = normalize(form_np_vector, norm="l2")
    return form_np_vector

@router.post("/SubmitModal")
async def submitModal(formInfo: FormInfo):
    try:
        user = await users_collection.find_one({"_id": formInfo.user_id})
        if not user:
            return {"error": "User not found"}

        if "rating_vector" not in user:
            user["rating_vector"] = []

        rating_vec = compute_vector(
            formInfo.genres,
            formInfo.fav_movies,
            formInfo.animated_movies,
            formInfo.older_recent
        ).squeeze().tolist()

        await users_collection.update_one(
            {"_id": formInfo.user_id},
            {"$set": {
                "rating_vector": rating_vec,
                "firstLogin": 0
            }}
        )
        user["rating_vector"] = rating_vec
    except Exception as e:
        print("Error submitting the preference modal form:", e)
        return {"error": "Failed to submit preferences"}
    return user["rating_vector"]

async def getCosRecommendations(user_id: int, top_n=5):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        return []

    form_vec = user.get("rating_vector", [])
    if not form_vec:
        return []

    form_vec = np.array(form_vec, dtype=np.float32).reshape(1, -1)
    faiss_index = faiss.read_index("./faiss.index")
    distances, indices = faiss_index.search(form_vec, top_n)
    movie_list = [backend.global_vars.movieId_list[i] for i in indices[0]]
    return movie_list

async def getSVDRecommendations(user_id: int, top_n=5):
    print("DEBUG: Entering getSVDRecommendations() for user_id:", user_id)

    try:
        inner_uid = backend.global_vars.trainset.to_inner_uid(user_id)
        print("DEBUG: Successfully mapped user to inner_uid:", inner_uid)
    except Exception as e:
        print("DEBUG: Could not map user to inner_uid. Possibly user not in trainset. Error:", e)
        return []

    user_items = {j for (j, _) in backend.global_vars.trainset.ur[inner_uid]}
    print("DEBUG: The user has rated:", len(user_items), "items so far.")

    testset = []
    for movie_id in backend.global_vars.movieId_list:
        try:
            inner_iid = backend.global_vars.trainset.to_inner_iid(movie_id)
        except Exception:
            continue

        if inner_iid not in user_items:
            testset.append((user_id, movie_id, 0))

    print("DEBUG: testset length is:", len(testset), "items.")

    predictions = backend.global_vars.SVD.test(testset)
    predictions.sort(key=lambda x: x.est, reverse=True)

    top_movie_ids = [pred.iid for pred in predictions[:top_n]]
    print("DEBUG: returning top movie IDs:", top_movie_ids)

    return top_movie_ids

@router.post("/recommendForUser")
async def recommendForUser(model: UserIdModel):
    user = await users_collection.find_one({"_id": model.user_id})
    if not user:
        return {"error": "User not found"}

    use_cf = user.get("useCollaborativeFiltering", False)

    if use_cf:
        svd_recs = await getSVDRecommendations(model.user_id)
        return {"method": "SVD", "recommendations": svd_recs}
    else:
        cos_recs = await getCosRecommendations(model.user_id)
        return {"method": "Cosine", "recommendations": cos_recs}