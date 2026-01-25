from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import os

router = APIRouter(prefix="/users", tags=["Users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(
        token,
        os.getenv("SECRET_KEY"),
        algorithms=[os.getenv("ALGORITHM")]
    )
    return payload["sub"]

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"email": user}
