#pylint: skip-file
import bcrypt
import secrets

#Used by /signup, /login, and /reset-password
def generateHash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")  

#Used by /login
def verifyPassword(entered_password: str, database_password: str) -> bool:
    return bcrypt.checkpw(entered_password.encode("utf-8"), database_password.encode("utf-8"))

#Used by /forgot-password
def generateResetToken() -> str:
    return secrets.token_hex(32)
