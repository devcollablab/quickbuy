from fastapi import FastAPI
from dotenv import load_dotenv
from app.database import engine, Base
from app.routes import auth_routes, user_routes
from app.routes import product_routes, admin_product_routes
from app.routes import admin_auth_routes, cart_routes
from app.routes import payment_routes, order_routes
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Auth Backend")

# ✅ ADD THIS (VERY IMPORTANT)
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