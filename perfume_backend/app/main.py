from fastapi import FastAPI
from dotenv import load_dotenv
from app.database import engine, Base
from app.routes import auth_routes, user_routes
from app.routes import product_routes, admin_product_routes
from app.routes import admin_auth_routes
from app.routes import admin_product_routes

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Auth Backend")

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(product_routes.router)
app.include_router(admin_product_routes.router)
app.include_router(admin_auth_routes.router)

