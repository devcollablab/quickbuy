from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any
import re
import phonenumbers
# ================= AUTH / USERS =================

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password", mode="after")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")

        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")

        if not re.search(r"\d", v):
            raise ValueError("Password must contain digit")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain special character")

        return v


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

    @field_validator("new_password", mode="after")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")

        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")

        if not re.search(r"\d", v):
            raise ValueError("Password must contain digit")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain special character")

        return v


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ================= TOKENS =================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_token_expires_in: int
    refresh_token_expires_in: int


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ================= PRODUCTS =================

class ProductBase(BaseModel):
    name: str
    brand: str
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):

    @model_validator(mode="after")
    def validate_product(cls, values):
        price = values.price
        stock = values.stock

        if price is None:
            raise ValueError("Either provide price or create variants later")

        return values

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

# ================= CART =================

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


# ================= RAZORPAY =================

class RazorpayOrderCreate(BaseModel):
    amount: float


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ================= ORDERS =================

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


# ================= USER PROFILE =================

class UserProfileCreate(BaseModel):
    full_name: Optional[str] = None
    phone_number: str
    gender: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @field_validator("phone_number", mode="after")
    def validate_phone(cls, v):
        try:
            parsed = phonenumbers.parse(v, "IN")

            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number")

            return phonenumbers.format_number(
                parsed,
                phonenumbers.PhoneNumberFormat.E164
            )

        except phonenumbers.NumberParseException:
            raise ValueError("Invalid phone number format")

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserProfileOut(BaseModel):
    full_name: Optional[str]
    phone_number: Optional[str]
    gender: Optional[str]
    address_line: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    country: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    profile_image_url: Optional[str]

    class Config:
        from_attributes = True


# ================= PROFILE AVATARS =================

class ProfileAvatarCreate(BaseModel):
    gender: str
    image_url: str


class ProfileAvatarOut(BaseModel):
    id: int
    gender: str
    image_url: str
    is_active: bool

    class Config:
        from_attributes = True


class SelectAvatarRequest(BaseModel):
    avatar_id: int
    
class GoogleLoginRequest(BaseModel):
    id_token: str

class CartRequest(BaseModel):
    product_id: int
    size_ml: Optional[int] = None
    quantity: int
    variant_id: Optional[int] = None
class VariantOut(BaseModel):
    id: int
    size_ml: Optional[int]
    price: float
    stock: int
    model_config = ConfigDict(from_attributes=True)

class ProductOut(BaseModel):
    id: int
    name: str
    brand: str
    description: Optional[str]
    price: float
    stock: Optional[int] = None
    has_variants: bool
    category: Optional[str]
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    is_active: bool
    variants: Optional[List[VariantOut]] = None

    model_config = ConfigDict(from_attributes=True)

class ProductV2Out(BaseModel):
    id: int
    name: str
    brand: str
    description: Optional[str]
    category: Optional[str]
    images: List[Dict[str, Any]]
    variants: Optional[List[VariantOut]] = None

    model_config = ConfigDict(from_attributes=True)