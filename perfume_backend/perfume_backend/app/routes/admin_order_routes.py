from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from typing import List
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from app.database import get_db
from app.models import Order, OrderItem
from app.auth import get_current_user
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Thread pool for CPU-heavy tasks
executor = ThreadPoolExecutor(max_workers=4)

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])


# =========================
# ADMIN GUARD
# =========================
def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


# =========================
# LIST ORDERS BY STATUS
# =========================
@router.get("")
def get_orders(
    status: str = "PENDING",
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    orders = (
        db.query(Order)
        .filter(Order.order_status == status)
        .order_by(Order.created_at.asc())
        .all()
    )
    return orders


# =========================
# SYNC PDF GENERATION
# =========================
def _generate_pdf(orders):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Admin Order Batch Report")
    y -= 20

    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, y, f"Generated At: {datetime.utcnow()}")
    y -= 30

    for order in orders:
        user = order.user
        items = order.items

        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y, f"Order ID: {order.id}")
        y -= 15

        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Customer Email: {user.email}")
        y -= 15
        pdf.drawString(50, y, f"Total Amount: ₹{order.total_amount}")
        y -= 15
        pdf.drawString(50, y, f"Status: {order.order_status}")
        y -= 15

        pdf.drawString(50, y, "Items:")
        y -= 15

        for item in items:
            product = getattr(item, "product", None)
            variant = getattr(item, "variant", None)

            product_name = product.name if product else "Deleted product"
            size_info = f"{variant.size_ml}ml" if variant and variant.size_ml else "Standard"

            pdf.drawString(
                70,
                y,
                f"- {product_name} | {size_info} | Qty {item.quantity} | Price ₹{item.price_at_purchase}"
            )
            y -= 15

        y -= 20
        if y < 100:
            pdf.showPage()
            y = height - 50

    pdf.save()
    buffer.seek(0)

    return buffer


# =========================
# ASYNC WRAPPER
# =========================
async def generate_pdf_async(orders):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        _generate_pdf,
        orders
    )


# =========================
# PENDING → PROCESSING (WITH PDF)
# =========================
@router.post("/batch-process")
async def batch_process_orders(
    order_ids: List[int],
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    if not order_ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.variant),
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user)
        )
        .filter(
            Order.id.in_(order_ids),
            Order.order_status == "PENDING"
        )
        .all()
    )

    if not orders:
        raise HTTPException(
            status_code=400,
            detail="No valid PENDING orders found"
        )

    # Generate PDF asynchronously
    buffer = await generate_pdf_async(orders)

    # Update order status
    for order in orders:
        order.order_status = "PROCESSING"

    db.commit()

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=order_batch.pdf"
        }
    )


# =========================
# PROCESSING → COMPLETED
# =========================
@router.post("/complete")
def complete_orders(
    order_ids: List[int],
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    if not order_ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    orders = (
        db.query(Order)
        .filter(
            Order.id.in_(order_ids),
            Order.order_status == "PROCESSING"
        )
        .all()
    )

    if not orders:
        raise HTTPException(
            status_code=400,
            detail="No PROCESSING orders found"
        )

    for order in orders:
        order.order_status = "COMPLETED"

    db.commit()

    return {
        "message": "Orders completed successfully",
        "completed_orders": order_ids
    }