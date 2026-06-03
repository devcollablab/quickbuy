"""
Razorpay Webhook Handler
Verifies webhook signatures and processes payment events
"""
import hmac
import hashlib
import json
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PaymentOrder, Order
from app.config import settings
from app.core.audit import log_payment_verified
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Razorpay webhook events.
    Verifies signature and updates payment status.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    # Verify webhook signature
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        logger.warning("Invalid Razorpay webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})

    if event == "payment.captured":
        razorpay_payment_id = payment_entity.get("id")
        razorpay_order_id = payment_entity.get("order_id")
        amount = payment_entity.get("amount", 0) / 100  # Convert paise to rupees

        # Update payment order status
        payment_order = db.query(PaymentOrder).filter(
            PaymentOrder.razorpay_order_id == razorpay_order_id
        ).first()

        if payment_order and payment_order.status != "PAID":
            # SECURITY: Validate amount matches to prevent tampering
            expected_amount = int(payment_order.amount * 100)  # Convert to paise
            if expected_amount != payment_entity.get("amount", 0):
                logger.warning(f"Amount mismatch for order {razorpay_order_id}: expected {expected_amount}, got {payment_entity.get('amount', 0)}")
                raise HTTPException(status_code=400, detail="Amount mismatch")

            payment_order.status = "PAID"

            # Update order if exists
            order = db.query(Order).filter(
                Order.razorpay_order_id == razorpay_order_id
            ).first()

            if order:
                order.payment_status = "PAID"
                log_payment_verified(
                    request=request,
                    user_id=order.user_id,
                    order_id=order.id,
                    payment_id=razorpay_payment_id,
                    amount=amount
                )

            db.commit()

    elif event == "payment.failed":
        razorpay_order_id = payment_entity.get("order_id")

        payment_order = db.query(PaymentOrder).filter(
            PaymentOrder.razorpay_order_id == razorpay_order_id
        ).first()

        if payment_order:
            payment_order.status = "FAILED"
            db.commit()

    return {"status": "ok"}
