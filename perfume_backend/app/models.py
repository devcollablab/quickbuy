from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship
import uuid


# ================= USERS =================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    auth_provider = Column(String(20), default="local")
    google_id = Column(String(255), unique=True, nullable=True)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    #Relationships
    orders = relationship("Order", back_populates="user", passive_deletes=True)
    cart_items = relationship("CartItem", back_populates="user", passive_deletes=True)
    refresh_tokens = relationship("RefreshToken", back_populates="user", passive_deletes=True)
    profile = relationship("UserProfile", back_populates="user", uselist=False, passive_deletes=True)


# ================= EMAIL OTP =================
class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    attempts = Column(Integer, default=0)

# ================= PRODUCTS =================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    description = Column(String(1000))
    variants = relationship("ProductVariant", back_populates="product", passive_deletes=True)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    price = Column(Float, nullable=True)   
    stock = Column(Integer, nullable=True) 
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    cart_items = relationship("CartItem", back_populates="product", passive_deletes=True)
    order_items = relationship("OrderItem", back_populates="product")
    images = relationship("ProductImage", back_populates="product", passive_deletes=True)



# ================= CART =================
class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )

    quantity = Column(Integer, default=1)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

# ================= USER PROFILE =================
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    full_name = Column(String(255))
    phone_number = Column(String(20))
    gender = Column(String(10))

    address_line = Column(String(500))
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(20))
    country = Column(String(100))

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    profile_image_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

# ================= PROFILE AVATARS =================
class ProfileAvatar(Base):
    __tablename__ = "profile_avatars"

    id = Column(Integer, primary_key=True, index=True)

    gender = Column(String(10), nullable=False)  # Male / Female / Other
    image_url = Column(String(500), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ================= ORDERS =================
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="SET NULL")
    )

    variant_id = Column(  
        Integer,
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True
    )

    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False)

    # relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
# ================= ORDER =================
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    razorpay_order_id = Column(String(255), nullable=False)
    razorpay_payment_id = Column(String(255), nullable=False)
    razorpay_signature = Column(String(255), nullable=False)

    total_amount = Column(Float, nullable=False)
    payment_status = Column(String(20), default="PAID")
    order_status = Column(String(20), default="PENDING")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    idempotency_key = Column(String(255), unique=True, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        passive_deletes=True
    )

# ================= PAYMENT ORDER =================
class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    razorpay_order_id = Column(String(255), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="CREATED")

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# ================= PRODUCT IMAGES =================
class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)

    image_uuid = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )

    image_url = Column(String(500), nullable=False)
    position = Column(Integer, default=1)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="images")


# ================= REFRESH TOKENS =================
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    token = Column(String(500), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)

    # NEW SECURITY FIELDS
    device_fingerprint = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    rotated_from = Column(Integer, ForeignKey("refresh_tokens.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    rotated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="refresh_tokens")

#==================== ProductVariant =================
class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False
    )

    size_ml = Column(Integer, nullable=True)  # NULL = default product
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="variants")