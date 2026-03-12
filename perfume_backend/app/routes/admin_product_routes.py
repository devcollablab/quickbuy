from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import cloudinary
import cloudinary.uploader
from app.database import get_db
from app.models import Product, ProductImage
from app.schemas import ProductCreate, ProductUpdate, ProductOut
from app.dependencies.admin import admin_required
from app.config import settings

router = APIRouter(
    prefix="/admin/products",
    tags=["Admin Products"],
)

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
    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


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

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


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


# =========================
# V1 API - Upload SINGLE IMAGE
# =========================
@router.post("/v1/{product_id}/upload-image")
async def upload_single_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:

        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="products"
        )

        image_url = upload_result["secure_url"]

        product.image_url = image_url

        db.commit()
        db.refresh(product)

        return {
            "message": "Product image uploaded successfully",
            "image_url": image_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

    existing_images = (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.position)
        .all()
    )

    results = []

    try:

        # Replace all if 5 images uploaded
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

                image_url = upload_result["secure_url"]

                new_image = ProductImage(
                    image_uuid=str(uuid.uuid4()),
                    product_id=product_id,
                    image_url=image_url,
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

                    new_image = ProductImage(
                        image_uuid=str(uuid.uuid4()),
                        product_id=product_id,
                        image_url=image_url,
                        position=position
                    )

                    db.add(new_image)

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