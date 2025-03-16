# pylint: skip-file
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set. Check your .env file.")

client = AsyncIOMotorClient(MONGODB_URL)
db = client["flicks"]  # Selects the user-advanced cluster
users_collection = db["users"]  # Selects Users collection, creates it if it doesn't exist
