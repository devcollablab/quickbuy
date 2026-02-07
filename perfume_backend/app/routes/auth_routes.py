from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import smtplib
from email.mime.text import MIMEText

from app.database import SessionLocal
from app.models import User, EmailOTP
from app.schemas import (
    UserCreate, UserLogin, Token, VerifyOTP,
    ForgotPassword, ResetPassword
)
from app.auth import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# EMAIL
# =========================
def send_otp_email(to_email: str, otp: str):
    msg = MIMEText(f"Your OTP is {otp}. It is valid for 5 minutes.")
    msg["Subject"] = "XYZ Perfumes - OTP Verification"
    msg["From"] = settings.EMAIL_USER
    msg["To"] = to_email

    server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
    server.starttls()
    server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()


def generate_and_send_otp(email: str, db: Session):
    last_otp = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == email)
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if last_otp and (datetime.utcnow() - last_otp.created_at).seconds < 60:
        raise HTTPException(
            status_code=429,
            detail="Please wait before requesting another OTP"
        )

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.query(EmailOTP).filter(EmailOTP.email == email).delete()

    db.add(
        EmailOTP(
            email=email,
            otp=otp,
            expires_at=expires_at
        )
    )
    db.commit()

    send_otp_email(email, otp)


# =========================
# SIGNUP
# =========================
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        is_verified=False
    )
    db.add(new_user)
    db.commit()

    generate_and_send_otp(user.email, db)

    return {"message": "OTP sent to email"}


# =========================
# RESEND OTP
# =========================
@router.post("/resend-otp")
def resend_otp(data: ForgotPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    generate_and_send_otp(data.email, db)
    return {"message": "OTP resent successfully"}


# =========================
# VERIFY OTP
# =========================
@router.post("/verify-otp", response_model=Token)
def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):

    record = db.query(EmailOTP).filter(
        EmailOTP.email == data.email,
        EmailOTP.otp == data.otp
    ).first()

    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == data.email).first()
    user.is_verified = True

    db.delete(record)
    db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# =========================
# FORGOT PASSWORD
# =========================
@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    generate_and_send_otp(data.email, db)
    return {"message": "OTP sent for password reset"}


# =========================
# RESET PASSWORD
# =========================
@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):

    record = db.query(EmailOTP).filter(
        EmailOTP.email == data.email,
        EmailOTP.otp == data.otp
    ).first()

    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == data.email).first()
    user.password = hash_password(data.new_password)

    db.delete(record)
    db.commit()

    return {"message": "Password reset successful"}


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": str(db_user.id)})
    refresh_token = create_access_token(
        {"sub": str(db_user.id)},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
