from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session

from app.config import settings
from app.auth import get_current_user
from app.database import get_db
from app.models import ProfileAvatar
from app.schemas import ProfileAvatarCreate, ProfileAvatarOut

router = APIRouter(prefix="/admin/media", tags=["Admin Media"])


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


@router.post("/avatar", response_model=ProfileAvatarOut)
async def upload_avatar(
    gender: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    result = cloudinary.uploader.upload(file.file)

    avatar = ProfileAvatar(
        gender=gender,
        image_url=result["secure_url"]
    )

    db.add(avatar)
    db.commit()
    db.refresh(avatar)

    return avatar


@router.get("/avatars", response_model=list[ProfileAvatarOut])
def list_avatars(
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    return db.query(ProfileAvatar).all()


@router.patch("/avatar/{avatar_id}")
def toggle_avatar(
    avatar_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    avatar = db.query(ProfileAvatar).filter(ProfileAvatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar.is_active = is_active
    db.commit()

    return {"message": "Avatar updated"}