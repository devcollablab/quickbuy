from fastapi import Depends, HTTPException, status, Header
from app.auth import get_current_user  # CORRECT IMPORT

ADMIN_SECRET_KEY = "SUPER_SECRET_ADMIN_KEY_12345"


def admin_required(
    user=Depends(get_current_user),
    x_admin_key: str | None = Header(default=None),
):
    """
    Admin-only access:
    1. Valid JWT
    2. User role must be admin
    3. Optional admin secret header (extra security)
    """

    # 🔒 Role-based protection (MAIN)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access only"
        )

    # 🔐 Optional secret header (defense in depth)
    if x_admin_key is not None and x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key"
        )

    return user