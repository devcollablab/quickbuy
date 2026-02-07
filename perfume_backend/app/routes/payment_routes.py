import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RazorpayOrderCreate
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/payment", tags=["Payment"])

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/create-order")
def create_razorpay_order(
    data: RazorpayOrderCreate,
    user=Depends(get_current_user)
):
    amount_paise = int(data.amount * 100)

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
