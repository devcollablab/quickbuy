from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ================= DATABASE =================
    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # ================= AUTH / JWT =================
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    # ================= EMAIL (OTP) =================
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str
    EMAIL_PASSWORD: str

    # ================= RAZORPAY =================
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    # ================= CLOUDINARY =================
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
