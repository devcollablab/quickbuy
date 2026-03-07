import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RazorpayOrderCreate
from app.auth import get_current_user
from app.config import settings
from app.models import CartItem, Product, PaymentOrder

router = APIRouter(prefix="/payment", tags=["Payment"])

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/create-order")
def create_razorpay_order(
    data: RazorpayOrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    # 1️⃣ Cart validation
    cart_items = db.query(CartItem).filter(
        CartItem.user_id == user.id
    ).all()

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    # 2️⃣ Calculate amount from cart (SECURE)
    total_amount = 0

    for item in cart_items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=400,
                detail="Product unavailable"
            )

        total_amount += product.price * item.quantity

    amount_paise = int(total_amount * 100)

    # 3️⃣ Create Razorpay order
    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1
    })

    # 4️⃣ Store order in DB
    payment_order = PaymentOrder(
        user_id=user.id,
        razorpay_order_id=order["id"],
        amount=total_amount,
        status="CREATED"
    )

    db.add(payment_order)
    db.commit()

    return {
        "razorpay_order_id": order["id"],
        "amount": order["amount"],
        "currency": "INR"
    }