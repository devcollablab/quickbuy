from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CartItem, Product, ProductVariant
from app.schemas import CartRequest
from app.auth import get_current_user
from app.core.rate_limiter import limiter

router = APIRouter(prefix="/cart", tags=["Cart"])

CART_LIMIT = "30/minute"


# =========================
# ADD TO CART
# =========================
@router.post("/add")
@limiter.limit(CART_LIMIT)
def add_to_cart(
    request: Request,
    data: CartRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be > 0")

    # CHECK: does product have variants?
    has_variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product.id
    ).first()

    # =========================
    # CASE 1: PRODUCT HAS VARIANTS
    # =========================
    if has_variants:
        if not data.variant_id:
            raise HTTPException(
                status_code=400,
                detail="variant_id is required for this product"
            )

        variant = db.query(ProductVariant).filter(
            ProductVariant.id == data.variant_id,
            ProductVariant.product_id == data.product_id
        ).with_for_update().first()

        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")

        existing = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.variant_id == variant.id
        ).with_for_update().first()

        current_qty = existing.quantity if existing else 0
        total = current_qty + data.quantity

        if total > variant.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {variant.stock - current_qty} items available"
            )

        if existing:
            existing.quantity += data.quantity
        else:
            db.add(CartItem(
                user_id=user.id,
                product_id=product.id,
                variant_id=variant.id,
                quantity=data.quantity
            ))

    # =========================
    # CASE 2: SIMPLE PRODUCT
    # =========================
    else:
        existing = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == product.id,
            CartItem.variant_id == None
        ).with_for_update().first()

        current_qty = existing.quantity if existing else 0
        total = current_qty + data.quantity

        if product.stock is not None and total > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock - current_qty} items available"
            )

        if existing:
            existing.quantity += data.quantity
        else:
            db.add(CartItem(
                user_id=user.id,
                product_id=product.id,
                variant_id=None,
                quantity=data.quantity
            ))

    db.commit()
    return {"message": "Item added to cart"}


# =========================
# VIEW CART
# =========================
@router.get("/")
def view_cart(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    items = db.query(CartItem).filter(
        CartItem.user_id == user.id
    ).all()

    response = []
    total = 0

    for item in items:
        if item.variant_id:
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == item.variant_id
            ).first()

            if not variant:
                continue

            product = db.query(Product).filter(
                Product.id == variant.product_id
            ).first()

            price = variant.price
            size_ml = variant.size_ml

        else:
            product = db.query(Product).filter(
                Product.id == item.product_id
            ).first()

            if not product:
                continue

            price = product.price
            size_ml = None

        if price is None:
            continue 

        subtotal = item.quantity * price
        total += subtotal

        response.append({
            "product_id": product.id,
            "name": product.name,
            "variant_id": item.variant_id,
            "size_ml": size_ml,
            "price": price,
            "quantity": item.quantity,
            "subtotal": subtotal,
            "image_url": product.image_url
        })

    return {"items": response, "total": total}


# =========================
# UPDATE CART
# =========================
@router.put("/update")
@limiter.limit(CART_LIMIT)
def update_cart(
    request: Request,
    data: CartRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if data.variant_id:
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.variant_id == data.variant_id
        ).with_for_update().first()

        variant = db.query(ProductVariant).filter(
            ProductVariant.id == data.variant_id
        ).with_for_update().first()

        if not cart_item or not variant:
            raise HTTPException(status_code=404, detail="Item not found")

        if data.quantity <= 0:
            db.delete(cart_item)
        else:
            if data.quantity > variant.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {variant.stock} items available"
                )
            cart_item.quantity = data.quantity

    else:
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == data.product_id,
            CartItem.variant_id == None
        ).with_for_update().first()

        product = db.query(Product).filter(
            Product.id == data.product_id
        ).with_for_update().first()

        if not cart_item or not product:
            raise HTTPException(status_code=404, detail="Item not found")

        if data.quantity <= 0:
            db.delete(cart_item)
        else:
            if product.stock and data.quantity > product.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {product.stock} items available"
                )
            cart_item.quantity = data.quantity

    db.commit()
    return {"message": "Cart updated"}


# =========================
# REMOVE ITEM
# =========================
@router.delete("/remove")
@limiter.limit(CART_LIMIT)
def remove_item(
    request: Request,
    product_id: int = None,
    variant_id: int = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if variant_id:
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.variant_id == variant_id
        ).with_for_update().first()
    else:
        cart_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == product_id,
            CartItem.variant_id == None
        ).with_for_update().first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    db.delete(cart_item)
    db.commit()

    return {"message": "Item removed"}