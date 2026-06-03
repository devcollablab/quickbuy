from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserProfile, ProfileAvatar
from app.schemas import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileOut,
    ProfileAvatarOut,
    SelectAvatarRequest
)
from app.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.post("/", response_model=UserProfileOut)
def create_profile(
    data: UserProfileCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if db.query(UserProfile).filter(UserProfile.user_id == user.id).first():
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = UserProfile(user_id=user.id, **data.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/", response_model=UserProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/", response_model=UserProfileOut)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


# ================= AVATARS =================

@router.get("/avatars", response_model=list[ProfileAvatarOut])
def get_available_avatars(
    gender: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(ProfileAvatar).filter(
        ProfileAvatar.gender == gender,
        ProfileAvatar.is_active == True
    ).all()


@router.post("/select-avatar")
def select_avatar(
    data: SelectAvatarRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    avatar = db.query(ProfileAvatar).filter(
        ProfileAvatar.id == data.avatar_id,
        ProfileAvatar.is_active == True
    ).first()

    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not available")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.profile_image_url = avatar.image_url
    db.commit()

    return {"message": "Avatar selected successfully"}