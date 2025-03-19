#pylint: skip-file
from fastapi import APIRouter, Body, HTTPException, status
from backend.models import UserModel, RatingModel
from backend.database import users_collection
from utils.hashing import generateHash
from typing import List

router = APIRouter()

ALL_GENRES = ["Action",
"Adventure",
"Animation",
"Children's",
"Comedy",
"Crime",
"Documentary",
"Drama",
"Fantasy",
"Film-Noir",
"Horror",
"Musical",
"Mystery",
"Romance",
"Sci-Fi",
"Thriller",
"War",
"Western"]

# Add user
@router.post("/signup", response_model=UserModel, status_code=status.HTTP_201_CREATED)
async def createUser(user: UserModel = Body(...)):
    existingUsername = await users_collection.find_one({"username": user.username})
    if existingUsername:
        raise HTTPException(status_code=400, detail="Username already exists")
    existingEmail = await users_collection.find_one({"email": user.email})
    if existingEmail:
        raise HTTPException(status_code=400, detail="Email already exists")
    user.password = generateHash(user.password)
    new_user = await users_collection.insert_one(user.model_dump(by_alias=True, exclude=["id"]))
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return created_user

# Get all users
@router.get("/all-users", response_model=List[UserModel], status_code=status.HTTP_200_OK)
async def listUsers():
    users = await users_collection.find().to_list(1000)
    return users

# Get user by username
@router.get("/{username}", response_model=UserModel)
async def showUser(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        return user
    raise HTTPException(status_code=404, detail=f"User {username} not found")

#get user by ID
@router.get("/{user_id}", response_model=UserModel)
async def showUser(user_id: str):
    user = await users_collection.find_one({"_id": user_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

# add rating for a user by their user ID
@router.post("/{user_id}/ratings", response_model=UserModel)
async def addRating(user_id: str, rating: RatingModel):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    if "ratings" not in user:
        user["ratings"] = []
    
    genre_dict = {genre: 1 if genre in rating.genres else 0 for genre in ALL_GENRES}
    rating_dict = rating.model_dump() 
    rating_dict["genres"] = genre_dict
    rating_dict["userId"] = user_id

    user["ratings"].append(rating_dict)


    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"ratings": user["ratings"]}}
    )

    updated_user_data = await users_collection.find_one({"_id": user["_id"]})
    return updated_user_data

# Get ratings for a user by their user ID
@router.get("/{user_id}/ratings", response_model=List[RatingModel])
async def getRatings(user_id: str):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    return user.get("ratings", [])
