import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_query():
    connection_string = "mongodb+srv://flubberyjubbery:IBR7A0MGAZ7amzSK@cluster0.itd6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "Flicks"
    collection_name = "rec_sys_data"
    
    client = AsyncIOMotorClient(connection_string)
    db = client[db_name]
    collection = db[collection_name]
    
    count = await collection.count_documents({})
    print("Document count:", count)
    
    async for doc in collection.find():
        print("Found document:", doc)   

if __name__ == "__main__":
    asyncio.run(test_query())