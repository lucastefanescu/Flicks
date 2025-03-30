import faiss
from backend import globals
from fastapi import APIRouter
from backend.database import users_collection
from backend.models import FormInfo, UserIdModel
from sklearn.preprocessing import normalize
import numpy as np

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

def compute_vector(genres: list, fav_movies: list, animated_movies: int, older_recent):

    form_vector = [0] * 20
    for i in range(len(genres)):
        if genres[i] in mapping:
            form_vector[mapping[genres[i]]] += 1

    for i in range(len(fav_movies)):
        if fav_movies[i] in mapping:
            form_vector[mapping[fav_movies[i]]] += 1

    form_vector[18] = animated_movies

    form_vector[19] = older_recent

    form_np_vector = np.array(form_vector, dtype=np.float32)

    form_np_vector = form_np_vector.reshape(1, -1)

    form_np_vector = normalize(form_np_vector, norm="l2")

    return form_np_vector

@router.post("/SubmitModal")
async def submitModal(formInfo: FormInfo):
    print(formInfo.genres, formInfo.user_id, formInfo.fav_movies, formInfo.animated_movies, formInfo.older_recent)
    try:
        user = await users_collection.find_one({"_id": formInfo.user_id})

        if "rating_vector" not in user:
            user["rating_vector"] = []
        
        rating_vec = compute_vector(formInfo.genres, formInfo.fav_movies, formInfo.animated_movies, formInfo.older_recent).squeeze().tolist()
        print(rating_vec)
        await users_collection.update_one(
            {"_id": formInfo.user_id},
            {"$set": {
                "rating_vector": rating_vec,
                "firstLogin": 0
                },
            }
        )
        user["rating_vector"] = rating_vec
    except:
        print("there was an error submiting the preference modal form")
    
    return user["rating_vector"]

@router.post("/getCosRecommendations")
async def cosine_similarity_input(UserIdModel: UserIdModel):
    
    user = await users_collection.find_one(
        {"_id": UserIdModel.user_id}
    )

    form_vec = user["rating_vector"]

    form_vec = np.array(form_vec, dtype=np.float32).reshape(1, -1)

    faiss_index = faiss.read_index("./faiss.index")

    d, indicies = faiss_index.search(form_vec, 5)

    movie_list = [globals.movieId_list[i] for i in indicies[0]]
    
    return {"movie ids": movie_list}