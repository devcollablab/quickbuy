from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session

from app.config import settings
from app.auth import get_current_user

router = APIRouter(prefix="/admin/media", tags=["Admin Media"])


# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


# 🔐 Admin Guard
def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    admin=Depends(get_admin)
):
    try:
        result = cloudinary.uploader.upload(file.file)
        return {
            "message": "Upload successful",
            "image_url": result["secure_url"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
