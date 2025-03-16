# pylint: skip-file
import os
import jwt
import datetime
from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from models import LoginModel, ForgotPasswordModel, ResetPasswordRequest
from database import users_collection
from utils.hashing import verifyPassword, generateResetToken, generateHash
from utils.emailUtils import sendResetEmail

# Load environment variables from .env file
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))

if not JWT_SECRET:
    raise ValueError("JWT_SECRET is not set in the environment variables. Please check your .env file.")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Function to create a JWT token
def create_jwt_token(data: dict):
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Authenticate User and Generate JWT
@router.post("/login")
async def login(user: LoginModel):
    db_user = await users_collection.find_one({"username": user.username})
    if not db_user or not verifyPassword(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create JWT Token
    token = create_jwt_token({"sub": db_user["username"], "id": str(db_user["_id"])})

    return {"message": "Login successful", "token": token, "user_id": str(db_user["_id"])}

@router.get("/protected")
async def protected_route(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"message": "Access granted", "user": payload}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Forgot Password
@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordModel):
    user = await users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    token = generateResetToken()
    await users_collection.update_one({"email": request.email}, {"$set": {"resetToken": token}})
    await sendResetEmail(request.email, token)
    return {"message": "Reset email sent"}

# Reset Password
@router.post("/reset-password/{token}")
async def reset_password(token: str, request: ResetPasswordRequest):
    user = await users_collection.find_one({"resetToken": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    hashed_password = generateHash(request.new_password)
    await users_collection.update_one({"resetToken": token}, {
        "$set": {"password": hashed_password},
        "$unset": {"resetToken": ""}  # Remove reset token
    })
    return {"message": "Password reset successful"}
