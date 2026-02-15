from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin_order_routes
from app.routes import admin_media_routes
from app.routes import user_profile_routes

from app.database import engine, Base
from app.routes import (
    auth_routes,
    user_routes,
    product_routes,
    cart_routes,
    admin_product_routes,
    admin_auth_routes,
    payment_routes,
    order_routes,
)

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Auth Backend")

# CORS (Frontend support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",     # Vite
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(product_routes.router)
app.include_router(cart_routes.router)
app.include_router(admin_product_routes.router)
app.include_router(admin_auth_routes.router)
app.include_router(payment_routes.router)
app.include_router(order_routes.router)
app.include_router(admin_order_routes.router)
app.include_router(admin_media_routes.router)
app.include_router(user_profile_routes.router)
