import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CartItem, Product, Order, OrderItem
from app.schemas import RazorpayVerify
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/orders", tags=["Orders"])

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/verify-payment")
def verify_payment_and_create_order(
    data: RazorpayVerify,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature
        })
    except:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        total += product.price * item.quantity

    order = Order(
        user_id=user.id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature,
        total_amount=total
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price
        ))
        db.delete(item)

    db.commit()
    return {"message": "Order placed successfully", "order_id": order.id}
