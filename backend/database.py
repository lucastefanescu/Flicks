import os
from motor.motor_asyncio import AsyncIOMotorClient

connection_string = ""

client = AsyncIOMotorClient(connection_string)
database = client[""]
recommendation_collection = database[""]
