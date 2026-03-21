from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserLogin, AdminToken
from app.auth import verify_password, create_access_token

router = APIRouter(
    prefix="/admin/auth",
    tags=["Admin Auth"]
)


# ====================================
# ADMIN LOGIN
# ====================================
@router.post("/login", response_model=AdminToken)
def admin_login(
    data: UserLogin,
    db: Session = Depends(get_db)
):

    # 1️⃣ Find user
    admin = db.query(User).filter(User.email == data.email).first()

    # 2️⃣ Check credentials
    if not admin or not verify_password(data.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3️⃣ Ensure admin role
    if admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an admin account"
        )

    # 4️⃣ Create access token
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "role": admin.role
        }
    )

    # 5️⃣ Return token
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }