from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import cloudinary
import cloudinary.uploader
from app.database import get_db
from app.models import Product, ProductImage ,ProductVariant
from app.schemas import ProductCreate, ProductUpdate, ProductOut
from app.dependencies.admin import admin_required
from app.config import settings
from html import escape
import magic

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
VALID_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

async def validate_image(file: UploadFile):
    contents = await file.read()

    # Size check
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"{file.filename}: File too large (max 5MB)"
        )

    # MIME check
    mime = magic.from_buffer(contents, mime=True)
    if mime not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"{file.filename}: Invalid file type"
        )

    # Filename check
    if not file.filename or "." not in file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name"
        )

    # Extension check
    ext = file.filename.split(".")[-1].lower()
    if ext not in VALID_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"{file.filename}: Invalid file extension"
        )

    # Reset pointer
    file.file.seek(0)


router = APIRouter(
    prefix="/admin/products",
    tags=["Admin Products"],
)

def get_display_variant(db: Session, product_id: int):
    variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id
    ).all()

    if not variants:
        return None

    # 1. Prefer default variant
    default = next((v for v in variants if v.size_ml is None), None)

    if default:
        return default

    # 2. Otherwise return lowest price variant
    return min(variants, key=lambda v: v.price)

# ================= CLOUDINARY CONFIG =================
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

# =========================
# CREATE PRODUCT
# =========================
@router.post("/", response_model=ProductOut)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    # SANITIZE INPUT
    safe_product = ProductCreate(
        name=escape(product.name),
        brand=escape(product.brand),
        description=escape(product.description) if product.description else None,
        price=product.price,
        stock=product.stock,
        category=product.category,
        image_url=product.image_url,
    )

    # =========================
    # CREATE PRODUCT (WITH PRICE)
    # =========================
    new_product = Product(
        name=safe_product.name,
        brand=safe_product.brand,
        description=safe_product.description,
        category=safe_product.category,
        image_url=safe_product.image_url,

        # IMPORTANT (store directly)
        price=safe_product.price,
        stock=safe_product.stock
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # =========================
    # RESPONSE (simple product initially)
    # =========================
    return {
        "id": new_product.id,
        "name": new_product.name,
        "brand": new_product.brand,
        "description": new_product.description,
        "category": new_product.category,
        "image_url": new_product.image_url,
        "is_active": new_product.is_active,
        "created_at": new_product.created_at,
        "updated_at": new_product.updated_at,

        "price": new_product.price,
        "stock": new_product.stock,
        "has_variants": False,
        "variants": None
    }

# =========================
# UPDATE PRODUCT 
# =========================
@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = payload.model_dump(exclude_unset=True)

    # =========================
    # CHECK IF VARIANTS EXIST
    # =========================
    db_variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product.id
    ).all()

    has_variants = len(db_variants) > 0

    # =========================
    # STRICT RULE
    # =========================
    if has_variants:
        # DO NOT allow price/stock update here
        if "price" in update_data or "stock" in update_data:
            raise HTTPException(
                status_code=400,
                detail="Product has variants. Update variants separately."
            )
    else:
        # SIMPLE PRODUCT → allow price/stock
        if "price" in update_data:
            if update_data["price"] is None or update_data["price"] <= 0:
                raise HTTPException(status_code=400, detail="Invalid price")
            product.price = update_data.pop("price")

        if "stock" in update_data:
            product.stock = update_data.pop("stock")

    # =========================
    # UPDATE OTHER FIELDS
    # =========================
    for key, value in update_data.items():
        if key in ["name", "brand", "description"] and value:
            value = escape(value)

        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    # =========================
    # RESPONSE
    # =========================
    if has_variants:
        variants = [
            {
                "size_ml": v.size_ml,
                "price": v.price,
                "stock": v.stock
            }
            for v in db_variants
        ]

        # display price = minimum variant price
        price = min(v["price"] for v in variants)

        return {
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "description": product.description,
            "category": product.category,
            "image_url": product.image_url,
            "is_active": product.is_active,
            "created_at": product.created_at,
            "updated_at": product.updated_at,

            "price": price,
            "has_variants": True,
            "variants": variants
        }

    else:
        return {
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "description": product.description,
            "category": product.category,
            "image_url": product.image_url,
            "is_active": product.is_active,
            "created_at": product.created_at,
            "updated_at": product.updated_at,

            "price": product.price,
            "stock": product.stock,
            "has_variants": False
        }

# =========================
# DELETE PRODUCT
# =========================
@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active == True)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product.is_active = False
    db.commit()


@router.post("/v1/{product_id}/upload-image")
async def upload_single_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    # CHECK PRODUCT
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # READ FILE
    contents = await file.read()

    # FILE SIZE CHECK
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large (max 5MB)"
        )

    # MIME TYPE CHECK
    mime = magic.from_buffer(contents, mime=True)
    if mime not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type"
        )

    # SAFE EXTENSION CHECK
    if not file.filename or "." not in file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name"
        )

    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in VALID_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file extension"
        )

    # RESET POINTER
    file.file.seek(0)

    # =========================
    # CLOUDINARY UPLOAD
    # =========================
    result = cloudinary.uploader.upload(file.file)

    product.image_url = result["secure_url"]
    db.commit()
    db.refresh(product)

    return {
        "message": "Image uploaded successfully",
        "image_url": product.image_url
    }


# =========================
# V2 API - Upload MULTIPLE IMAGES
# =========================
@router.post("/v2/{product_id}/upload-images")  
async def upload_multiple_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # VALIDATE ALL FILES FIRST (IMPORTANT)
    for file in files:
        await validate_image(file)

    existing_images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position)
        .all()
    )

    results = []

    try:

        if len(files) == 5:

            db.query(ProductImage).filter(
                ProductImage.product_id == product_id
            ).delete()

            position = 1

            for file in files:
                upload_result = cloudinary.uploader.upload(
                    file.file,
                    folder="products"
                )

                new_image = ProductImage(
                    image_uuid=str(uuid.uuid4()),
                    product_id=product_id,
                    image_url=upload_result["secure_url"],
                    position=position
                )

                db.add(new_image)

                results.append({
                    "file": file.filename,
                    "status": "replaced",
                    "position": position
                })

                position += 1

        else:

            total_existing = len(existing_images)

            for file in files:

                upload_result = cloudinary.uploader.upload(
                    file.file,
                    folder="products"
                )

                image_url = upload_result["secure_url"]

                if total_existing < 5:

                    position = total_existing + 1

                    db.add(ProductImage(
                        image_uuid=str(uuid.uuid4()),
                        product_id=product_id,
                        image_url=image_url,
                        position=position
                    ))

                    results.append({
                        "file": file.filename,
                        "status": "added",
                        "position": position
                    })

                    total_existing += 1

                else:

                    last_image = (
                        db.query(ProductImage)
                        .filter(ProductImage.product_id == product_id)
                        .order_by(ProductImage.position.desc())
                        .first()
                    )

                    last_image.image_url = image_url

                    results.append({
                        "file": file.filename,
                        "status": "replaced",
                        "position": last_image.position
                    })

        db.commit()

        return {
            "message": "Upload completed",
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# =========================
# UPDATE SINGLE PRODUCT IMAGE
# =========================
@router.put("/image/{image_uuid}")
async def update_single_product_image(
    image_uuid: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    image = (
        db.query(ProductImage)
        .filter(ProductImage.image_uuid == image_uuid)
        .first()
    )

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # VALIDATE FILE
    await validate_image(file)

    try:

        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="products"
        )

        image.image_url = upload_result["secure_url"]

        db.commit()
        db.refresh(image)

        return {
            "message": "Image updated successfully",
            "image_uuid": image.image_uuid,
            "image_url": image.image_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# DELETE PRODUCT IMAGE
# =========================
@router.delete("/image/{image_uuid}")
def delete_product_image(
    image_uuid: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    image = (
        db.query(ProductImage)
        .filter(ProductImage.image_uuid == image_uuid)
        .first()
    )

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully",
        "image_uuid": image_uuid
    }

@router.get("/image/{image_uuid}")
def get_product_image_by_uuid(
    image_uuid: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    image = (
        db.query(ProductImage)
        .filter(ProductImage.image_uuid == image_uuid)
        .first()
    )

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    return {
        "image_uuid": image.image_uuid,
        "product_id": image.product_id,
        "image_url": image.image_url,
        "position": image.position,
        "created_at": image.created_at,
        "updated_at": image.updated_at
    }
#==========================================
# create_product
#==========================================
@router.post("/{product_id}/variants")
def create_variants(
    product_id: int,
    variants: list[dict],
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not variants:
        raise HTTPException(status_code=400, detail="Variants required")

    # DELETE old variants
    db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id
    ).delete()

    # IMPORTANT: CLEAR PRODUCT PRICE/STOCK
    product.price = None
    product.stock = None

    for v in variants:
        if not v.get("price") or v.get("price") <= 0:
            raise HTTPException(status_code=400, detail="Invalid variant price")

        db.add(ProductVariant(
            product_id=product_id,
            size_ml=v.get("size_ml"),
            price=v.get("price"),
            stock=v.get("stock", 0)
        ))

    db.commit()

    return {"message": "Variants created successfully"}
# =========================
# HARD DELETE PRODUCT
# =========================
@router.delete("/{product_id}/permanent", status_code=204)
def hard_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # SAFETY CHECK
    if product.is_active:
        raise HTTPException(
            status_code=400,
            detail="Please deactivate product before permanent delete"
        )

    # HARD DELETE
    db.delete(product)
    db.commit()

    return

# =========================
# DELETE ALL VARIANTS
# =========================
@router.delete("/{product_id}/variants")
def delete_all_variants(
    product_id: int,
    price: float,
    stock: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if price <= 0:
        raise HTTPException(status_code=400, detail="Valid price required")

    # delete variants
    db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id
    ).delete()

    # IMPORTANT: SET PRODUCT PRICE BACK
    product.price = price
    product.stock = stock

    db.commit()

    return {"message": "Variants removed, product converted to simple"}
# =========================
# UPDATE SINGLE VARIANT
# =========================
@router.put("/variants/{variant_id}")
def update_variant(
    variant_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == variant_id
    ).first()

    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Variant not found"
        )

    # update fields
    if "price" in payload:
        variant.price = payload["price"]

    if "stock" in payload:
        variant.stock = payload["stock"]

    if "size_ml" in payload:
        variant.size_ml = payload["size_ml"]

    db.commit()
    db.refresh(variant)

    return {
        "id": variant.id,
        "product_id": variant.product_id,
        "size_ml": variant.size_ml,
        "price": variant.price,
        "stock": variant.stock
    }

# =========================
# DELETE SINGLE VARIANT
# =========================
@router.delete("/variants/{variant_id}", status_code=204)
def delete_variant(
    variant_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == variant_id
    ).first()

    if not variant:
        raise HTTPException(
            status_code=404,
            detail="Variant not found"
        )

    db.delete(variant)
    db.commit()

    return