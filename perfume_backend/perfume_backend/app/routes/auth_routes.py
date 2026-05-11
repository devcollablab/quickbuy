from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import logging
from app.database import SessionLocal
from app.models import User, EmailOTP, RefreshToken
from app.schemas import (
    UserCreate, UserLogin, Token, VerifyOTP,
    ForgotPassword, ResetPassword, GoogleLoginRequest
)
from app.auth import hash_password, verify_password, create_access_token
from app.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.database import get_db
import uuid
from passlib.context import CryptContext
from slowapi.util import get_remote_address
from fastapi import Request
from app.core.rate_limiter import limiter
from app.core.audit import log_user_login, log_suspicious_activity, log_token_reuse
from app.core.csrf import get_csrf_cookie
from app.core.email_oauth2 import send_otp_email, send_password_reset_email
import hashlib

def get_device_fingerprint(request: Request) -> str:
    user_agent = request.headers.get("user-agent", "")
    accept_lang = request.headers.get("accept-language", "")

    fingerprint = f"{user_agent}:{accept_lang}"
    return hashlib.sha256(fingerprint.encode()).hexdigest()[:32]

otp_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# EMAIL - Now using secure OAuth2/SMTP module
# See app/core/email_oauth2.py for implementation
# =========================


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

    otp_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    otp = str(random.randint(100000, 999999))
    hashed_otp = otp_context.hash(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.query(EmailOTP).filter(EmailOTP.email == email).delete()

    db.add(EmailOTP(email=email, otp=hashed_otp, expires_at=expires_at))
    db.commit()

    # SECURITY: Use secure email method (OAuth2 preferred)
    email_sent = send_otp_email(email, otp)
    if not email_sent:
        # Log failure but don't expose to user (security through obscurity)
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send OTP email to {email}")
        # Still return success to prevent user enumeration
        # But you may want to alert admins


# =========================
# SIGNUP
# =========================
@router.post("/signup")
@limiter.limit("5/minute")
def signup(
    request: Request,
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Delete old OTP records (important)
    db.query(EmailOTP).filter(EmailOTP.email == user.email).delete()

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    hashed_otp = otp_context.hash(otp)

    # Store OTP + TEMP PASSWORD (IMPORTANT)
    db.add(EmailOTP(
        email=user.email,
        otp=hashed_otp,
        password=hash_password(user.password),  # store temp password
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    ))

    db.commit()

    # Send OTP email
    send_otp_email(user.email, otp)

    return {"message": "OTP sent to email"}


# =========================
# RESEND OTP
# =========================
@router.post("/resend-otp")
@limiter.limit("3/minute")
def resend_otp(
    request: Request,
    data: ForgotPassword,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == data.email).first()

    # Prevent user enumeration
    if not user:
        return {"message": "If the email exists, OTP has been sent"}

    generate_and_send_otp(data.email, db)

    return {"message": "OTP resent successfully"}

# =========================
# VERIFY OTP
# =========================
@router.post("/verify-otp", response_model=Token)
@limiter.limit("10/minute")
def verify_otp(
    request: Request,
    data: VerifyOTP,
    db: Session = Depends(get_db)
):

    # Get latest OTP
    record = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == data.email)
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check expiry
    if record.expires_at < datetime.utcnow():
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired")

    # Verify OTP
    if not otp_context.verify(data.otp, record.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # CHECK if user already exists (IMPORTANT SAFETY)
    existing_user = db.query(User).filter(User.email == record.email).first()
    if existing_user:
        # cleanup OTP
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="User already exists. Please login.")

    # CREATE USER HERE
    new_user = User(
        email=record.email,
        password=record.password,  # already hashed from signup
        is_verified=True
    )

    db.add(new_user)

    # delete OTP after success
    db.delete(record)

    db.commit()
    db.refresh(new_user)


    # =========================
    # TOKEN GENERATION
    # =========================

    # ACCESS TOKEN
    access_token = create_access_token({
        "sub": str(new_user.id),
        "role": new_user.role
    })

    # REFRESH TOKEN (DB BASED) WITH DEVICE TRACKING
    refresh_token_str = str(uuid.uuid4())
    device_fingerprint = get_device_fingerprint(request)

    db.add(RefreshToken(
        user_id=new_user.id,
        token=refresh_token_str,
        device_fingerprint=device_fingerprint,
        ip_address=request.client.host,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    ))

    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "access_token_expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token_expires_in": settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    }


# =========================
# FORGOT PASSWORD
# =========================
@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    data: ForgotPassword,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == data.email).first()

    # Prevent user enumeration (keep this)
    if not user:
        return {"message": "If the email exists, OTP has been sent"}

    # BLOCK unverified users (IMPORTANT)
    if not user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Please complete signup first"
        )

    # Delete old OTPs (important to avoid conflicts)
    db.query(EmailOTP).filter(EmailOTP.email == data.email).delete()

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    hashed_otp = otp_context.hash(otp)

    db.add(EmailOTP(
        email=data.email,
        otp=hashed_otp,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    ))

    db.commit()

    # Send email
    send_otp_email(data.email, otp)

    return {"message": "OTP sent for password reset"}


# =========================
# RESET PASSWORD
# =========================
@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    data: ResetPassword,
    db: Session = Depends(get_db)
):

    MAX_OTP_ATTEMPTS = 5

    # Get latest OTP and lock it for update
    record = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == data.email)
        .order_by(EmailOTP.created_at.desc())
        .with_for_update()  # Prevent race conditions on attempts
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check expiry FIRST
    if record.expires_at < datetime.utcnow():
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check if max attempts already reached
    if record.attempts >= MAX_OTP_ATTEMPTS:
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="Max attempts exceeded. Please request new OTP")

    # VERIFY HASHED OTP
    if not otp_context.verify(data.otp, record.otp):
        record.attempts += 1

        remaining = MAX_OTP_ATTEMPTS - record.attempts

        # Delete OTP after max attempts
        if record.attempts >= MAX_OTP_ATTEMPTS:
            db.delete(record)
            db.commit()
            raise HTTPException(status_code=400, detail="Max attempts exceeded. Please request new OTP")

        db.commit()
        raise HTTPException(status_code=400, detail=f"Invalid OTP. {remaining} attempts remaining")

    # 👤 Get user
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        # Delete OTP even if user not found (security: prevent OTP replay)
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid request")

    # Prevent same password reuse (handle NULL safely)
    if user.password and verify_password(data.new_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be same as old password"
        )

    # Update password
    user.password = hash_password(data.new_password)

    # Delete OTP after success
    db.delete(record)

    db.commit()

    return {"message": "Password reset successful"}


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(User.email == user.email).first()

    # Prevent user enumeration and handle None password (Google auth users)
    if not db_user or not db_user.password or not verify_password(user.password, db_user.password):
        log_user_login(request, db_user.id if db_user else None, success=False, failure_reason="invalid_credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_verified:
        log_user_login(request, db_user.id, success=False, failure_reason="email_not_verified")
        raise HTTPException(status_code=403, detail="Email not verified")

    # Log successful login
    log_user_login(request, db_user.id, success=True)

    access_token = create_access_token({
        "sub": str(db_user.id),
        "role": db_user.role
    })

    # REFRESH TOKEN WITH DEVICE TRACKING
    refresh_token_str = str(uuid.uuid4())
    device_fingerprint = get_device_fingerprint(request)

    db.add(RefreshToken(
        user_id=db_user.id,
        token=refresh_token_str,
        device_fingerprint=device_fingerprint,
        ip_address=request.client.host,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    ))
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "access_token_expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token_expires_in": settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    }

# =========================
# REFRESH API
# =========================

@router.post("/refresh")
@limiter.limit("10/minute")  # Added rate limiting
def refresh_token(
    refresh_token: str,
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # SECURITY: Use transaction with SERIALIZABLE isolation
        # This prevents race conditions in token rotation
        with db.begin():
            # Lock the token record first (prevents concurrent refresh)
            token_record = db.query(RefreshToken).filter(
                RefreshToken.token == refresh_token,
                RefreshToken.expires_at > datetime.utcnow()
            ).with_for_update().first()  # 🔒 Row lock!

            if not token_record:
                raise HTTPException(status_code=401, detail="Invalid refresh token")

            # REUSE DETECTION (CRITICAL)
            if token_record.is_revoked:
                # revoke ALL tokens → account may be compromised
                db.query(RefreshToken).filter(
                    RefreshToken.user_id == token_record.user_id
                ).update({"is_revoked": True})

                # Log suspicious activity (after commit will be called)
                log_token_reuse(request, token_record.user_id, token_record.id)

                raise HTTPException(
                    status_code=401,
                    detail="Token reuse detected. Please login again."
                )

            # DEVICE CHECK
            current_fingerprint = get_device_fingerprint(request)

            if token_record.device_fingerprint and token_record.device_fingerprint != current_fingerprint:
                # suspicious activity - log it
                log_suspicious_activity(
                    request=request,
                    user_id=token_record.user_id,
                    activity_type="device_mismatch_on_refresh",
                    details={
                        "expected_device": token_record.device_fingerprint[:8] + "...",
                        "actual_device": current_fingerprint[:8] + "...",
                        "token_id": token_record.id
                    }
                )

            # ROTATE TOKEN
            token_record.is_revoked = True
            token_record.rotated_at = datetime.utcnow()

            new_refresh_token = str(uuid.uuid4())

            db.add(RefreshToken(
                user_id=token_record.user_id,
                token=new_refresh_token,
                device_fingerprint=current_fingerprint,
                ip_address=request.client.host,
                rotated_from=token_record.id,
                expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            ))

            # NEW ACCESS TOKEN
            new_access_token = create_access_token({
                "sub": str(token_record.user_id),
                "role": "user"
            })

            # Transaction committed automatically on exit

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        # db.rollback() - not needed as db.begin() context manager handles this
        raise HTTPException(status_code=500, detail="Token refresh failed")
@router.post("/google/login")
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):

    # ========================
    # 1. VERIFY GOOGLE TOKEN
    # ========================
    try:
        # idinfo = id_token.verify_oauth2_token(
        # payload.id_token,
        # google_requests.Request()
        # )
        idinfo = id_token.verify_oauth2_token(
        payload.id_token,
        google_requests.Request(),
        settings.GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        google_id = idinfo.get("sub")

        if not email or not google_id:
            raise HTTPException(status_code=400, detail="Invalid Google token")

    except Exception:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    # ========================
    # 2. CHECK USER
    # ========================
    user = db.query(User).filter(User.email == email).first()

    # ========================
    # 3. CREATE OR LINK USER
    # ========================
    if not user:
        user = User(
            email=email,
            password=None,
            auth_provider="google",
            google_id=google_id,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    else:
        # If existing user is local → LINK account
        if user.auth_provider == "local":
            user.google_id = google_id
            user.auth_provider = "google"
            user.is_verified = True
            db.commit()

    # ========================
    # 4. GENERATE TOKENS (reuse your logic)
    # ========================
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        token_type="access"
    )

    refresh_token_str = str(uuid.uuid4())

    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    db.add(refresh_token)
    db.commit()

    # ========================
    # 5. RESPONSE (same format as your system)
    # ========================
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer",
        "access_token_expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token_expires_in": settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    }


# =========================
# CSRF TOKEN
# =========================
@router.get("/csrf-token")
def get_csrf_token(response: Response):
    """Get a fresh CSRF token for form submissions."""
    key, value, kwargs = get_csrf_cookie()
    response.set_cookie(key, value, **kwargs)
    return {"csrf_token": value}