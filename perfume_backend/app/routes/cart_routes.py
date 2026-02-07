from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CartItem, Product
from app.schemas import CartAdd, CartUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


# ➕ ADD TO CART
@router.post("/add")
def add_to_cart(
    data: CartAdd,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == user.id,
            CartItem.product_id == data.product_id
        )
        .first()
    )

    if cart_item:
        cart_item.quantity += data.quantity
    else:
        cart_item = CartItem(
            user_id=user.id,
            product_id=data.product_id,
            quantity=data.quantity
        )
        db.add(cart_item)

    db.commit()
    return {"message": "Item added to cart"}


# 📄 VIEW CART
@router.get("/")
def view_cart(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    items = (
        db.query(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
        .filter(CartItem.user_id == user.id)
        .all()
    )

    response = []
    total = 0

    for cart_item, product in items:
        subtotal = cart_item.quantity * product.price
        total += subtotal

        response.append({
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": cart_item.quantity,
            "subtotal": subtotal
        })

    return {"items": response, "total": total}


# 🔄 UPDATE QUANTITY
@router.put("/update")
def update_cart(
    data: CartUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == user.id,
            CartItem.product_id == data.product_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if data.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = data.quantity

    db.commit()
    return {"message": "Cart updated"}


# ❌ REMOVE ITEM
@router.delete("/remove/{product_id}")
def remove_item(
    product_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == user.id,
            CartItem.product_id == product_id
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed"}
