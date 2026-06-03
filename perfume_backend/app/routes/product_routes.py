from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Product, ProductImage, ProductVariant
from app.schemas import ProductOut, ProductV2Out
from app.core.rate_limiter import limiter
from app.config import redis_client
from collections import defaultdict
import json

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

# =========================
# SECURITY: Whitelist allowed sort columns
# =========================
ALLOWED_SORT_COLUMNS = {
    "id": Product.id,
    "name": Product.name,
    "created_at": Product.created_at,
}
ALLOWED_SORT_ORDERS = {"asc", "desc"}

# =========================
# CONSTANTS
# =========================
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

@router.get("/", response_model=list[ProductOut], response_model_exclude_none=True)
@limiter.limit("100/minute")
def get_all_products(
    request: Request,
    category_name: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if sort_by and sort_by not in ALLOWED_SORT_COLUMNS:
        raise HTTPException(status_code=400, detail="Invalid sort column")

    if sort_order not in ALLOWED_SORT_ORDERS:
        raise HTTPException(status_code=400, detail="Invalid sort order")

    cache_key = f"products:{category_name}:{sort_by}:{sort_order}:{page}:{per_page}"

    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    query = db.query(Product).filter(Product.is_active == True)

    if category_name:
        query = query.filter(Product.category == category_name)

    if sort_by:
        sort_column = ALLOWED_SORT_COLUMNS.get(sort_by)

        if not sort_column:
            raise HTTPException(status_code=400, detail="Invalid sort column")
        if sort_order == "desc":
            sort_column = sort_column.desc()

        query = query.order_by(sort_column)
    else:
        query = query.order_by(Product.id.desc())

    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    if not products:
        redis_client.setex(cache_key, 300, json.dumps([], default=str))
        return []
    product_ids = [p.id for p in products]
    # fetch ALL variants in ONE query
    all_variants = db.query(ProductVariant).filter(
    ProductVariant.product_id.in_(product_ids)
    ).all()
    # map them
    variant_map = defaultdict(list)
    for v in all_variants:
        variant_map[v.product_id].append(v)
    result = []

    for p in products:
        db_variants = variant_map.get(p.id, [])
        base_data = {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "description": p.description,
            "category": p.category,
            "image_url": p.image_url,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        }

        # =========================
        # CASE 1: PRODUCT HAS VARIANTS
        # =========================
        if db_variants:
            variants = [
                {
                    "id": v.id,
                    "size_ml": v.size_ml,
                    "price": v.price,
                    "stock": v.stock
                }
                for v in db_variants
            ]

            price = min(v["price"] for v in variants)

            result.append({
                **base_data,
                "price": price,
                "has_variants": True,
                "variants": variants
            })

        # =========================
        # CASE 2: SIMPLE PRODUCT
        # =========================
        else:
            if p.price is None:
                continue

            result.append({
                **base_data,
                "price": p.price,
                "stock": p.stock,
                "has_variants": False
            })

    redis_client.setex(cache_key,300,json.dumps(result, default=str))

    return result


# =========================
# V2 APIs
# =========================
@router.get("/v2", response_model=list[ProductV2Out])
@limiter.limit("100/minute")
def get_all_products_v2(
    request: Request,
    category_name: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("asc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if sort_by and sort_by not in ALLOWED_SORT_COLUMNS:
        raise HTTPException(status_code=400, detail="Invalid sort column")
    if sort_order not in ALLOWED_SORT_ORDERS:
        raise HTTPException(status_code=400, detail="Invalid sort order")
    cache_key = f"products_v2:{category_name}:{sort_by}:{sort_order}:{page}:{per_page}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    query = db.query(Product).filter(Product.is_active == True)

    if category_name:
        if category_name not in ALLOWED_CATEGORIES:
            raise HTTPException(status_code=400, detail="Invalid category")
        query = query.filter(Product.category == category_name)

    if sort_by:
        sort_column = ALLOWED_SORT_COLUMNS.get(sort_by)

        if not sort_column:
            raise HTTPException(status_code=400, detail="Invalid sort column")

        if sort_order == "desc":
            sort_column = sort_column.desc()

        query = query.order_by(sort_column)
    else:
        query = query.order_by(Product.id.desc())

    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    if not products:
        redis_client.setex(cache_key, 300, json.dumps([], default=str))
        return []
    product_ids = [p.id for p in products]
    # fetch ALL variants in ONE query
    all_variants = db.query(ProductVariant).filter(
    ProductVariant.product_id.in_(product_ids)
    ).all()

    variant_map = defaultdict(list)
    for v in all_variants:
        variant_map[v.product_id].append(v)
    # map
    images = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.position).all()

    image_map = defaultdict(list)
    for img in images:
        image_map[img.product_id].append(img.image_url)

    result = []

    for product in products:
        db_variants = variant_map.get(product.id, [])   

        variants = [
            {
                "id": v.id,
                "size_ml": v.size_ml,
                "price": v.price,
                "stock": v.stock
            }
            for v in db_variants
        ]

        result.append({
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "description": product.description,
            "category": product.category,
            "images": image_map.get(product.id, []),
            "variants": variants
        })
    redis_client.setex(cache_key, 300, json.dumps(result, default=str))
    return result


# =========================
# SINGLE PRODUCT V2
# =========================
@router.get("/v2/{product_id}", response_model=ProductV2Out)
def get_product_by_id_v2(
    product_id: int,
    db: Session = Depends(get_db)
):
    # Fetch product
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Fetch ALL images (ordered)
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product.id
    ).order_by(ProductImage.position.asc()).all()

    image_urls = [
        {
            "position": img.position,
            "url": img.image_url
        }
        for img in images
    ]

    # Fetch variants
    db_variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product.id
    ).all()

    variants = [
        {
            "id": v.id,
            "size_ml": v.size_ml,
            "price": v.price,
            "stock": v.stock
        }
        for v in db_variants
    ] if db_variants else []

    # Final response
    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "description": product.description,
        "category": product.category,
        "images": image_urls,   # list of {position, url}
        "variants": variants    # empty list if no variants
    }


# =========================
# SINGLE PRODUCT V1
# =========================
@router.get("/{product_id}", response_model=ProductOut, response_model_exclude_none=True)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # GET ALL IMAGES (IMPORTANT FIX)
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product.id
    ).order_by(ProductImage.position).all()

    image_urls = [img.image_url for img in images]

    db_variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product.id
    ).all()

    base_data = {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "description": product.description,
        "category": product.category,
        "is_active": product.is_active,
        "created_at": product.created_at,
        "updated_at": product.updated_at,

        # 🔥 FIXED: return all images
        "images": image_urls
    }

    # =========================
    # CASE 1: PRODUCT HAS VARIANTS
    # =========================
    if db_variants:
        variants = [
            {
                "id": v.id,
                "size_ml": v.size_ml,
                "price": v.price,
                "stock": v.stock
            }
            for v in db_variants
        ]

        price = min(v["price"] for v in variants)

        return {
            **base_data,
            "price": price,
            "has_variants": True,
            "variants": variants
        }

    # =========================
    # CASE 2: SIMPLE PRODUCT
    # =========================
    else:
        if product.price is None:
            raise HTTPException(
                status_code=400,
                detail="Product has no price configured"
            )

        return {
            **base_data,
            "price": product.price,
            "stock": product.stock,
            "has_variants": False
        }