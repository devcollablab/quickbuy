from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserProfile
from app.schemas import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileOut
)
from app.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])


# 🟢 CREATE PROFILE (only once)
@router.post("/", response_model=UserProfileOut)
def create_profile(
    data: UserProfileCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    existing = db.query(UserProfile).filter(
        UserProfile.user_id == user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(
        user_id=user.id,
        **data.dict()
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


# 🔵 GET PROFILE
@router.get("/", response_model=UserProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


# 🟡 UPDATE PROFILE
@router.put("/", response_model=UserProfileOut)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile