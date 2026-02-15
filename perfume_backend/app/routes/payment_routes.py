import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RazorpayOrderCreate
from app.auth import get_current_user
from app.config import settings
from app.models import CartItem

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
    # 🔐 1️⃣ STRICT VALIDATION: Cart must NOT be empty
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty. Please add items to cart before checkout."
        )

    # 2️⃣ Keep your existing amount logic (NO BREAKING CHANGE)
    amount_paise = int(data.amount * 100)

    # 3️⃣ Create Razorpay order
    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1
    })

    return {
        "razorpay_order_id": order["id"],
        "amount": order["amount"],
        "currency": "INR"
    }
