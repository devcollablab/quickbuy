from fastapi import Depends, HTTPException, status, Header
from app.auth import get_current_user  # CORRECT IMPORT
from app.config import settings

ADMIN_SECRET_KEY = settings.ADMIN_SECRET_KEY


def admin_required(
    user=Depends(get_current_user),
    x_admin_key: str | None = Header(default=None),
):
    # Role-based protection
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access only"
        )

    # Mandatory admin secret key
    if not x_admin_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin secret key required"
        )

    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key"
        )

    return user