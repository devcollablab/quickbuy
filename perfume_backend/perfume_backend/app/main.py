from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import uuid
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.config import settings
from app.core.rate_limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

# Routes
from app.routes import (
    auth_routes,
    user_routes,
    product_routes,
    cart_routes,
    admin_product_routes,
    admin_auth_routes,
    payment_routes,
    order_routes,
    admin_order_routes,
    admin_media_routes,
    user_profile_routes,
    admin_avatar_routes,
    avatar_routes,
    webhook_routes,
)
from app.routes.admin_auth_routes import router as admin_auth_router

# =========================
# LOAD ENV
# =========================
load_dotenv()
ENV = os.getenv("ENV", "dev")

# =========================
# DB INIT
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# APP INIT
# =========================
app = FastAPI(
    title="FastAPI Auth Backend",
    docs_url=None if ENV == "prod" else "/docs",
    redoc_url=None if ENV == "prod" else "/redoc",
    openapi_url=None if ENV == "prod" else "/openapi.json",
)

# =========================
# RATE LIMITER
# =========================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# =========================
# SECURITY HEADERS & HTTPS ENFORCEMENT
# =========================
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    if ENV == "prod":
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        is_https = forwarded_proto == "https" or request.url.scheme == "https"

        if not is_https:
            return JSONResponse(
                status_code=400,
                content={"detail": "HTTPS required"}
            )

    response = await call_next(request)

    response.headers["X-Request-ID"] = str(uuid.uuid4())

    if ENV == "prod" or request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self'; connect-src 'self';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"

    return response

# =========================
# REQUEST SIZE LIMIT
# =========================
class LimitRequestSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")

        if content_length:
            if int(content_length) > 10 * 1024 * 1024:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request too large"}
                )

        return await call_next(request)

# =========================
# GZIP
# =========================
app.add_middleware(GZipMiddleware, minimum_size=1000)

# =========================
# CORS
# =========================
def get_cors_origins():
    if ENV == "prod":
        origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
        return origins
    return ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    # allow_headers=["Authorization", "Content-Type", "X-Admin-Key", "Idempotency-Key"],
    allow_headers = ["*"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

# =========================
# REQUEST SIZE LIMIT (REGISTER)
# =========================
app.add_middleware(LimitRequestSizeMiddleware)

# =========================
# PRODUCTION SECURITY
# =========================
if ENV == "prod":
    allowed_hosts = ["*"]

# =========================
# API VERSIONING
# =========================
v1_router = APIRouter(prefix="/api/v1")
v2_router = APIRouter(prefix="/api/v2")

# V1 ROUTES
v1_router.include_router(auth_routes.router)
v1_router.include_router(user_routes.router)
v1_router.include_router(product_routes.router)
v1_router.include_router(cart_routes.router)
v1_router.include_router(payment_routes.router)
v1_router.include_router(order_routes.router)
v1_router.include_router(admin_product_routes.router)
v1_router.include_router(admin_auth_routes.router)
v1_router.include_router(admin_order_routes.router)
v1_router.include_router(admin_media_routes.router)
v1_router.include_router(user_profile_routes.router)
v1_router.include_router(admin_avatar_routes.router)
v1_router.include_router(avatar_routes.router)
v1_router.include_router(admin_auth_router)
v1_router.include_router(webhook_routes.router)

# V2 ROUTES
v2_router.include_router(admin_product_routes.router)

# Attach versioned routers
app.include_router(v1_router)
app.include_router(v2_router)

# =========================
# BACKWARD COMPATIBILITY (FIXED SAFELY)
# =========================
# Only include PUBLIC routes here to avoid admin conflict

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(product_routes.router)
app.include_router(cart_routes.router)
app.include_router(payment_routes.router)
app.include_router(order_routes.router)
app.include_router(user_profile_routes.router)
app.include_router(avatar_routes.router)
app.include_router(webhook_routes.router)


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

# =========================
# READINESS CHECK
# =========================
@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )