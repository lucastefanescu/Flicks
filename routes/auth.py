#pylint: skip-file
from fastapi import APIRouter, Body, HTTPException
from models import LoginModel, ForgotPasswordModel, ResetPasswordRequest
from database import users_collection
from utils.hashing import verifyPassword, generateResetToken, generateHash
from utils.emailUtils import sendResetEmail

router = APIRouter()

# Authenticate User
@router.post("/login")
async def login(user: LoginModel):
    db_user = await users_collection.find_one({"username": user.username})
    if not db_user or not verifyPassword(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful"}

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
