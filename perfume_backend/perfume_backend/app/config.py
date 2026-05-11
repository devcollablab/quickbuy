from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # ================= DATABASE =================
    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"

    # ================= AUTH / JWT =================
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    @field_validator("SECRET_KEY", mode="after")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        if v.lower() in ["secret", "password", "123456"]:
            raise ValueError("SECRET_KEY is too weak")
        return v

    # ================= REDIS =================
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # ================= EMAIL (OTP) =================
    # Legacy SMTP (not recommended - use OAuth2 below)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str
    EMAIL_PASSWORD: str  # App Password, not main Gmail password

    # OAuth2 Configuration (RECOMMENDED)
    # Get these from Google Cloud Console: https://console.cloud.google.com/
    GMAIL_OAUTH2_CLIENT_ID: Optional[str] = None
    GMAIL_OAUTH2_CLIENT_SECRET: Optional[str] = None
    GMAIL_OAUTH2_REFRESH_TOKEN: Optional[str] = None
    # Set to True to force OAuth2, False to use SMTP
    EMAIL_USE_OAUTH2: bool = False

    # ================= RAZORPAY =================
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ================= CLOUDINARY =================
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # ================= GOOGLE AUTH =================
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # ================= ADMIN =================
    ADMIN_SECRET_KEY: str

    # ================= CORS =================
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings():
    """Factory function to get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()


# ================= REDIS CLIENT (LAZY INITIALIZATION) =================
import redis
import json
import logging

logger = logging.getLogger(__name__)
_redis_client = None


def get_redis_client() -> redis.Redis:
    """
    Lazy initialization of Redis client.
    Creates connection only when first accessed.
    Includes retry logic and connection health checks.
    """
    global _redis_client

    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                decode_responses=True,
                socket_connect_timeout=5,      # Connection timeout
                socket_timeout=5,                # Operation timeout
                health_check_interval=30,      # Health check every 30s
                retry_on_timeout=True,          # Auto-retry on timeout
                retry_on_error=[redis.ConnectionError, redis.TimeoutError],
            )
            # Test the connection
            _redis_client.ping()
            logger.info(f"Redis connected to {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        except redis.ConnectionError as e:
            logger.error(f"Redis connection failed: {e}")
            # Return a mock client that logs operations but doesn't fail
            # This allows the app to function without Redis (degraded mode)
            _redis_client = _get_mock_redis()

    return _redis_client


class MockRedis:
    """
    Mock Redis client for when Redis is unavailable.
    Logs operations but doesn't store data.
    """

    def __init__(self):
        self._logger = logging.getLogger(__name__ + ".mock_redis")
        self._logger.warning("Using MockRedis - Redis unavailable. Some features disabled.")

    def get(self, key: str) -> None:
        self._logger.debug(f"MockRedis.get({key})")
        return None

    def set(self, key: str, value, **kwargs) -> bool:
        self._logger.debug(f"MockRedis.set({key}, ...)")
        return True

    def setex(self, key: str, seconds: int, value: str) -> bool:
        self._logger.debug(f"MockRedis.setex({key}, {seconds}, ...)")
        return True

    def delete(self, *keys) -> int:
        self._logger.debug(f"MockRedis.delete({keys})")
        return len(keys)

    def ping(self) -> bool:
        return True

    def exists(self, *keys) -> int:
        return 0


def _get_mock_redis():
    """Get or create mock Redis client."""
    return MockRedis()


# Legacy support - maintain backward compatibility
# This will use lazy initialization via __getattr__ pattern
class LazyRedis:
    """
    Proxy class for lazy Redis access.
    Allows import-time access but defers connection until first use.
    """

    def __getattr__(self, name):
        client = get_redis_client()
        return getattr(client, name)


# Global redis_client - uses lazy proxy
redis_client = LazyRedis()
