from pydantic import BaseModel, EmailStr
from typing import Optional, List
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


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# TOKENS
# =========================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


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


# =========================
# CART
# =========================

class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartUpdate(BaseModel):
    product_id: int
    quantity: int


class CartItemOut(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    subtotal: float


# =========================
# RAZORPAY / PAYMENT
# =========================

class RazorpayOrderCreate(BaseModel):
    amount: float  # amount in rupees


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# =========================
# ORDERS
# =========================

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float


class OrderOut(BaseModel):
    id: int
    total_amount: float
    payment_status: str
    order_status: str
    created_at: datetime
