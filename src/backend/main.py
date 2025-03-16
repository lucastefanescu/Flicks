from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)


class Rating(BaseModel):
    rating: float

@app.post("/rate")
async def receive_rating(rating: Rating):
    print(f"Received rating: {rating.rating}")
    return {"message": "Rating received", "rating": rating.rating}
