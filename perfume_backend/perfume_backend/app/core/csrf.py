"""
CSRF Protection Module - Double Submit Cookie Pattern
"""
import secrets
from fastapi import Request, HTTPException
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app.config import settings

# Create serializer for CSRF tokens
csrf_serializer = URLSafeTimedSerializer(
    settings.SECRET_KEY,
    salt="csrf-token"
)

CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"
MAX_AGE = 3600  # 1 hour


def generate_csrf_token() -> str:
    """Generate a new CSRF token."""
    return csrf_serializer.dumps(secrets.token_urlsafe(32))


def validate_csrf_token(request: Request) -> None:
    """
    Validate CSRF token from cookie and header.
    Must be used as a dependency on state-changing operations.
    """
    # Skip CSRF for GET, HEAD, OPTIONS (read-only operations)
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return

    cookie_token = request.cookies.get(CSRF_COOKIE_NAME)
    header_token = request.headers.get(CSRF_HEADER_NAME)

    if not cookie_token:
        raise HTTPException(
            status_code=403,
            detail="CSRF cookie missing"
        )

    if not header_token:
        raise HTTPException(
            status_code=403,
            detail=f"CSRF header {CSRF_HEADER_NAME} missing"
        )

    # Validate cookie token signature
    try:
        csrf_serializer.loads(cookie_token, max_age=MAX_AGE)
    except SignatureExpired:
        raise HTTPException(
            status_code=403,
            detail="CSRF token expired"
        )
    except BadSignature:
        raise HTTPException(
            status_code=403,
            detail="Invalid CSRF token"
        )

    # Compare tokens
    if cookie_token != header_token:
        raise HTTPException(
            status_code=403,
            detail="CSRF token mismatch"
        )


def get_csrf_cookie() -> tuple:
    """
    Get CSRF cookie settings for response.
    Returns: (key, value, kwargs)
    """
    token = generate_csrf_token()
    return (
        CSRF_COOKIE_NAME,
        token,
        {
            "httponly": False,  # Must be readable by JavaScript
            "secure": True,     # Only send over HTTPS
            "samesite": "strict",
            "max_age": MAX_AGE,
            "path": "/"
        }
    )
