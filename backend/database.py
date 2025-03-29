import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

current_directory = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_directory, '.env')

load_dotenv(dotenv_path)

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL is not set. Check your .env file.")

client = AsyncIOMotorClient(MONGODB_URL)
db = client["flicks"]  # Selects the user-advanced cluster
users_collection = db["users"]  # Selects Users collection, creates it if it doesn't exist
recommendation_collection = db["rec_sys_data"]
counter_collection = db["counter"]
links_collection = db["links"]