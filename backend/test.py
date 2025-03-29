import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from database import users_collection

async def test_query():
    user = await users_collection.find_one({"_id": 7005})
    print("Found user:", user)

if __name__ == "__main__":
    asyncio.run(test_query())