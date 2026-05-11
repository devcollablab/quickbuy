from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:"
    f"{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}/"
    f"{settings.DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # Check connections before using
    pool_size=5,            # Base number of connections
    max_overflow=10,        # Extra connections during high load
    pool_timeout=30,        # Wait max 30s for connection
    pool_recycle=1800,      # Recycle after 30 minutes
    echo=False              # Set True only for debugging
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


# THIS IS WHAT WAS MISSING
def get_db():
    db = SessionLocal()
    try:
        yield db
        
    finally:
        db.close()

