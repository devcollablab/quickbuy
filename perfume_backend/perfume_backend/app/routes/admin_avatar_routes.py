from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader

from app.database import get_db
from app.models import ProfileAvatar
from app.config import settings
from app.auth import get_current_user

router = APIRouter(prefix="/admin/avatars", tags=["Admin Avatars"])


# ================= CLOUDINARY CONFIG =================
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


# ================= ADMIN GUARD =================
def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


# ================= UPLOAD AVATAR =================
@router.post("/upload")
async def upload_avatar(
    gender: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="profile_avatars"
        )

        avatar = ProfileAvatar(
            gender=gender.lower(),
            image_url=upload_result["secure_url"],
            is_active=True
        )

        db.add(avatar)
        db.commit()
        db.refresh(avatar)

        return {
            "message": "Avatar uploaded successfully",
            "avatar_id": avatar.id,
            "image_url": avatar.image_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= LIST AVATARS =================
@router.get("/")
def list_avatars(
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    avatars = db.query(ProfileAvatar).all()
    return avatars


# ================= ACTIVATE / DEACTIVATE =================
@router.put("/{avatar_id}/toggle")
def toggle_avatar(
    avatar_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    avatar = db.query(ProfileAvatar).filter(ProfileAvatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar.is_active = not avatar.is_active
    db.commit()

    return {
        "avatar_id": avatar.id,
        "is_active": avatar.is_active
    }


# ================= DELETE AVATAR =================
@router.delete("/{avatar_id}")
def delete_avatar(
    avatar_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    avatar = db.query(ProfileAvatar).filter(ProfileAvatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    db.delete(avatar)
    db.commit()

    return {"message": "Avatar deleted"}