from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# =========================
# AUTH / USERS
# =========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# TOKENS
# =========================

# 🔐 Normal user token (with refresh)
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# 🔐 Admin token (NO refresh token)
class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# =========================
# PRODUCTS
# =========================

class ProductBase(BaseModel):
    name: str
    brand: str
    description: Optional[str] = None
    price: float
    stock: int
    category: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
