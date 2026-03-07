from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ProfileAvatar, UserProfile
from app.auth import get_current_user

router = APIRouter(prefix="/avatars", tags=["Avatars"])


# ================= GET AVAILABLE AVATARS =================
@router.get("/")
def get_available_avatars(
    gender: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    avatars = (
        db.query(ProfileAvatar)
        .filter(
            ProfileAvatar.gender == gender.lower(),
            ProfileAvatar.is_active == True
        )
        .all()
    )

    return avatars


# ================= SELECT AVATAR =================
@router.post("/select/{avatar_id}")
def select_avatar(
    avatar_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    avatar = db.query(ProfileAvatar).filter(
        ProfileAvatar.id == avatar_id,
        ProfileAvatar.is_active == True
    ).first()

    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.profile_image_url = avatar.image_url

    db.commit()

    return {
        "message": "Avatar selected successfully",
        "avatar_url": avatar.image_url
    }