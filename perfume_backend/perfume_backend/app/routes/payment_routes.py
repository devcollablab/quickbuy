import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RazorpayOrderCreate
from app.auth import get_current_user
from app.config import settings
from app.models import CartItem, Product, PaymentOrder ,ProductVariant
from app.core.rate_limiter import limiter, PAYMENT_LIMIT

router = APIRouter(prefix="/payment", tags=["Payment"])

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/create-order")
@limiter.limit(PAYMENT_LIMIT)
def create_razorpay_order(
    request: Request,
    data: RazorpayOrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    # =========================
    # CART VALIDATION
    # =========================
    cart_items = db.query(CartItem).filter(
        CartItem.user_id == user.id
    ).all()

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    # =========================
    # CALCULATE TOTAL (CORRECT LOGIC)
    # =========================
    total_amount = 0

    for item in cart_items:

        # Lock product (optional but good practice)
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} unavailable"
            )

        # =========================
        # HANDLE VARIANT vs SIMPLE
        # =========================
        if item.variant_id:

            variant = db.query(ProductVariant).filter(
                ProductVariant.id == item.variant_id,
                ProductVariant.product_id == product.id
            ).first()

            if not variant:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variant {item.variant_id} not found"
                )

            if variant.price is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variant {variant.id} has no price"
                )

            price = variant.price

        else:
            if product.price is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product {product.id} has no price"
                )

            price = product.price

        # =========================
        # TOTAL CALCULATION
        # =========================
        total_amount += price * item.quantity

    # Convert to paise
    amount_paise = int(total_amount * 100)

    if amount_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid order amount"
        )

    # =========================
    # CREATE RAZORPAY ORDER
    # =========================
    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Razorpay error: {str(e)}"
        )

    # =========================
    # STORE ORDER IN DB
    # =========================
    payment_order = PaymentOrder(
        user_id=user.id,
        razorpay_order_id=order["id"],
        amount=total_amount,   # stored in ₹ (not paise)
        status="CREATED"
    )

    db.add(payment_order)
    db.commit()

    return {
        "razorpay_order_id": order["id"],
        "amount": order["amount"],   # paise
        "currency": "INR"
    }