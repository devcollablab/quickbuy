import razorpay
import time
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CartItem, Product, ProductVariant, Order, OrderItem, PaymentOrder, User
from app.core.email_oauth2 import send_order_confirmation_email
from app.schemas import RazorpayVerify
from app.auth import get_current_user
from app.config import settings, redis_client
from app.core.audit import log_payment_verified, log_order_created, log_suspicious_activity
from app.core.rate_limiter import limiter, PAYMENT_LIMIT
from fastapi import Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlalchemy import text

router = APIRouter(prefix="/orders", tags=["Orders"])
logger = logging.getLogger(__name__)

# Razorpay client
client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/verify-payment")
@limiter.limit(PAYMENT_LIMIT)
def verify_payment_and_create_order(
    request: Request,
    data: RazorpayVerify,
    idempotency_key: str = Header(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    lock_key = f"payment_lock:{idempotency_key}"

    lock_acquired = redis_client.set(lock_key, "1", nx=True, ex=30)

    if not lock_acquired:
        time.sleep(0.5)

        existing_order = db.query(Order).filter(
            Order.idempotency_key == idempotency_key
        ).first()

        if existing_order:
            return {
                "message": "Order already processed",
                "order_id": existing_order.id
            }

        raise HTTPException(status_code=409, detail="Order processing in progress")

    try:
        # Lock payment order
        payment_order = db.query(PaymentOrder).filter(
            PaymentOrder.razorpay_order_id == data.razorpay_order_id,
            PaymentOrder.user_id == user.id
        ).with_for_update().first()

        if not payment_order or payment_order.status == "PAID":
            raise HTTPException(
                status_code=400,
                detail="Invalid or already processed payment"
            )

        # Lock cart
        cart_items = db.query(CartItem).filter(
            CartItem.user_id == user.id
        ).with_for_update().all()

        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        total_amount = 0
        order_items_data = []

        # =========================
        # HANDLE VARIANT + SIMPLE PRODUCT
        # =========================
        for item in cart_items:

            # CASE 1: VARIANT PRODUCT
            if item.variant_id:
                variant = db.query(ProductVariant).filter(
                    ProductVariant.id == item.variant_id
                ).with_for_update().first()

                if not variant:
                    raise HTTPException(
                        status_code=400,
                        detail="Variant no longer available"
                    )

                if variant.stock < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {variant.size_ml}ml"
                    )

                variant.stock -= item.quantity

                price = variant.price
                product_id = variant.product_id

            # CASE 2: SIMPLE PRODUCT
            else:
                product = db.query(Product).filter(
                    Product.id == item.product_id,
                    Product.is_active == True
                ).with_for_update().first()

                if not product:
                    raise HTTPException(
                        status_code=400,
                        detail="Product unavailable"
                    )

                if product.stock < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {product.name}"
                    )

                product.stock -= item.quantity

                price = product.price
                product_id = product.id

            if price is None:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid pricing configuration"
                )

            subtotal = price * item.quantity
            total_amount += subtotal

            order_items_data.append({
                "product_id": product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "price": price
            })

        # =========================
        # CREATE ORDER
        # =========================
        order = Order(
            user_id=user.id,
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
            razorpay_signature=data.razorpay_signature,
            idempotency_key=idempotency_key,
            total_amount=total_amount,
            payment_status="PAID",
            order_status="PENDING"
        )

        db.add(order)
        db.flush()

        # =========================
        # CREATE ORDER ITEMS
        # =========================
        for item_data in order_items_data:
            db.add(OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                variant_id=item_data["variant_id"],
                quantity=item_data["quantity"],
                price_at_purchase=item_data["price"]
            ))

        # =========================
        # CLEAR CART
        # =========================
        for item in cart_items:
            db.delete(item)

        # =========================
        # UPDATE PAYMENT STATUS
        # =========================
        payment_order.status = "PAID"

        # FINAL COMMIT
        db.commit()

        return {
            "message": "Order placed successfully",
            "order_id": order.id
        }

    except Exception as e:
        logger.error(f"VERIFY PAYMENT ERROR: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        redis_client.delete(lock_key)

@router.get("/my-orders")
def get_my_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    offset = (page - 1) * per_page

    query = db.query(Order).options(
        joinedload(Order.items)
        .joinedload(OrderItem.product),
        joinedload(Order.items)
        .joinedload(OrderItem.variant) 
    ).filter(
        Order.user_id == user.id
    ).order_by(Order.id.desc())

    total = query.count()
    orders = query.offset(offset).limit(per_page).all()

    if not orders:
        return {
            "message": "No orders found",
            "orders": [],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": 0,
                "pages": 0
            }
        }

    response = []

    for order in orders:
        products = []

        for item in order.items:

            product = item.product
            variant = getattr(item, "variant", None)

            # SAFE FALLBACKS
            product_name = product.name if product else "Product removed"
            image_url = product.image_url if product else None

            size_ml = variant.size_ml if variant else None

            products.append({
                "product_id": item.product_id,
                "name": product_name,
                "size_ml": size_ml,  
                "price": item.price_at_purchase,
                "quantity": item.quantity,
                "total": item.price_at_purchase * item.quantity,
                "image_url": image_url
            })

        response.append({
            "order_id": order.id,
            "total_amount": order.total_amount,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "products": products
        })

    return {
        "total_orders": total,
        "orders": response,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    }