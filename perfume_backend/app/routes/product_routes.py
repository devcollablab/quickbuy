from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Product, ProductImage
from app.schemas import ProductOut, ProductV2Out

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

# Allowed categories
ALLOWED_CATEGORIES = [
    "Men",
    "Women",
    "Unisex",
    "Premium",
    "Most popular",
    "Best sellers"
]


# =========================
# V1 APIs
# =========================

# 🔓 PUBLIC: Get products (v1)
@router.get("/", response_model=list[ProductOut])
def get_all_products(
    category_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(Product).filter(Product.is_active == True)

    if category_name:

        if category_name not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail="Invalid category."
            )

        query = query.filter(Product.category == category_name)

    return query.all()


# =========================
# V2 APIs
# =========================

# 🔓 PUBLIC: Get all products v2
@router.get("/v2", response_model=list[ProductV2Out])
def get_all_products_v2(
    category_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(Product).filter(Product.is_active == True)

    if category_name:

        if category_name not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail="Invalid category."
            )

        query = query.filter(Product.category == category_name)

    products = query.all()

    result = []

    for product in products:

        images = db.query(ProductImage).filter(
            ProductImage.product_id == product.id
        ).order_by(ProductImage.position).all()

        image_urls = [img.image_url for img in images]

        result.append({
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "category": product.category,
            "images": image_urls
        })

    return result


# 🔓 PUBLIC: Get single product v2
@router.get("/v2/{product_id}", response_model=ProductV2Out)
def get_product_by_id_v2(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    images = db.query(ProductImage).filter(
        ProductImage.product_id == product.id
    ).order_by(ProductImage.position).all()

    image_urls = [img.image_url for img in images]

    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category": product.category,
        "images": image_urls
    }


# 🔓 PUBLIC: Get single product by ID (v1)
@router.get("/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product