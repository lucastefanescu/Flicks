from fastapi import APIRouter, Body, HTTPException, status
from backend.models import UserModel, RatingModel
from backend.database import users_collection, counter_collection, links_collection, recommendation_collection
from backend.utils.hashing import generateHash
from typing import List
from pymongo import ReturnDocument
import numpy as np
from sklearn.preprocessing import normalize

router = APIRouter()

ALL_GENRES = [

    "Action",
    "Adventure",
    "Children's",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Film-Noir",
    "Horror",
    "IMAX",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
    "Animation"

]

async def getUserId() -> int:
    doc = await counter_collection.find_one_and_update(
        {"name": "counter"},
        {"$inc": {"current_counter": 1}},
        return_document=ReturnDocument.AFTER
    )
    return doc["current_counter"]

@router.post("/signup", response_model=UserModel, status_code=status.HTTP_201_CREATED)
async def createUser(user: UserModel = Body(..., exclude={"firstLogin"})):
    existingUsername = await users_collection.find_one({"username": user.username})
    if existingUsername:
        raise HTTPException(status_code=400, detail="Username already exists")
    existingEmail = await users_collection.find_one({"email": user.email})
    if existingEmail:
        raise HTTPException(status_code=400, detail="Email already exists")
    user.password = generateHash(user.password)
    new_id = await getUserId()
    user.id = new_id
    user.firstLogin = 1

    new_user = await users_collection.insert_one(user.model_dump(by_alias=True))
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return created_user

# Get all users
@router.get("/all-users", response_model=List[UserModel], status_code=status.HTTP_200_OK)
async def listUsers():
    users = await users_collection.find().to_list(1000)
    return users

# Get user by username
# @router.get("/{username}", response_model=UserModel)
# async def showUser(username: str):
#     user = await users_collection.find_one({"username": username})
#     if user:
#         return user
#     raise HTTPException(status_code=404, detail=f"User {username} not found")

#get user by ID
@router.get("/{user_id}", response_model=UserModel)
async def showUser(user_id: int): 
    user = await users_collection.find_one({"_id": user_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

async def addRatingRecSys(rating: RatingModel):
    genre_list = [1 if genre in rating.genres else 0 for genre in ALL_GENRES]
    year_list = [rating.year]
    genre_list = genre_list + year_list

    genre_list = np.array(genre_list, dtype=np.float32)
    genre_list = genre_list.reshape(1, -1)
    genre_list = normalize(genre_list, norm="l2")
    genre_list = genre_list.squeeze()

    genre_list = genre_list.tolist()

    tmbd_id = await links_collection.find_one({"tmdbId": rating.movieId})

    result_dict = {"userId": rating.userId, "movieId": tmbd_id["movieId"], "rating": rating.rating, "title": rating.title, "cos_vector": genre_list}
    
    result = await recommendation_collection.insert_one(result_dict)

    return result

# add rating for a user by their user ID
@router.post("/{user_id}/ratings", response_model=UserModel)
async def addRating(user_id: int, rating: RatingModel):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    if "ratings" not in user:
        user["ratings"] = []
    
    genres = rating.genres

    genres = [item.strip() for item in genres.split(",")]

    rating.genres = genres
    
    user["ratings"].append(rating.movieId)
    rating.userId = user_id

    await addRatingRecSys(rating)

    await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"ratings": user["ratings"]}}
    )

    updated_user_data = await users_collection.find_one({"_id": user_id})
    return updated_user_data

# Get ratings for a user by their user ID
@router.get("/{user_id}/ratings", response_model=List[RatingModel])
async def getRatings(user_id: str):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    return user.get("ratings", [])
