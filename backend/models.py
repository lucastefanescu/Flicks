#pylint: skip-file
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, EmailStr
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated

# ObjectId Handling
PyObjectId = Annotated[str, BeforeValidator(str)]

class FormInfo(BaseModel):
    user_id: int
    genres: list
    fav_movies: list
    animated_movies: int
    older_recent: int

class RatingModel(BaseModel):
    userId: int
    movieId: int
    rating: float
    title: str
    year: str
    genres: str

# Model for user signup
class UserModel(BaseModel):
    id: Optional[int] = Field(alias="_id", default=None)
    firstName: str = Field(...)
    lastName: str = Field(...)
    email: EmailStr = Field(...)
    username: str = Field(...)
    password: str = Field(...)

    ratings: Optional[List[int]] = []
    rating_vector: Optional[List[int]] = []

# Model for user login
class LoginModel(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

# Model for forgot password request
class ForgotPasswordModel(BaseModel):
    email: EmailStr

# Model for User Collection
class UsersCollection(BaseModel):
    users: List[UserModel]

#Model for password reset
class ResetPasswordRequest(BaseModel):
    new_password: str
