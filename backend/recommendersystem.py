import faiss
from backend import globals
from fastapi import HTTPException, APIRouter
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sklearn.preprocessing import normalize
import numpy as np
from backend.database import recommendation_collection

router = APIRouter()

class FormInfo(BaseModel):
    user_id: int
    genres: list
    fav_movies: list
    animated_movies: int
    older_recent: int

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
        form_vector[mapping[genres[i]]] += 1

    for i in range(len(fav_movies)):
        form_vector[mapping[fav_movies[i]]] += 1

    form_vector[18] = animated_movies

    form_vector[19] = older_recent

    form_np_vector = np.array(form_vector, dtype=np.float32)

    form_np_vector = form_np_vector.reshape(1, -1)

    form_np_vector = normalize(form_np_vector, norm="l2")

    return form_np_vector

@router.post("/")
async def cosine_similarity_input(Form_Info: FormInfo):
    form_vec = compute_vector(genres = Form_Info.genres, fav_movies=Form_Info.fav_movies, animated_movies=Form_Info.animated_movies, older_recent=Form_Info.older_recent)
    faiss_index = faiss.read_index("./faiss.index")

    d, indicies = faiss_index.search(form_vec, 5)

    print(globals.movieId_list)

    movie_list = [globals.movieId_list[i] for i in indicies[0]]

    return {"movie ids": movie_list}