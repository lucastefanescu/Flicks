#pylint: skip-file
from fastapi import APIRouter, Body, HTTPException, status
from models import UserModel
from database import users_collection
from utils.hashing import generateHash
from typing import List

router = APIRouter()

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
