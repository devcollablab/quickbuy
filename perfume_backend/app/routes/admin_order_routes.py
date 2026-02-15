from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from io import BytesIO
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.database import get_db
from app.models import Order, OrderItem, User, Product
from app.auth import get_current_user

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])


# 🔐 ADMIN GUARD
def get_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


# 1️⃣ LIST ORDERS BY STATUS
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


# 2️⃣ PENDING → PROCESSING (WITH PDF)
@router.post("/batch-process")
def batch_process_orders(
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
            Order.order_status == "PENDING"
        )
        .all()
    )

    if not orders:
        raise HTTPException(
            status_code=400,
            detail="No valid PENDING orders found"
        )

    # 📄 CREATE PDF
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
        user = db.query(User).filter(User.id == order.user_id).first()
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(50, y, f"Order ID: {order.id}")
        y -= 15

        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Customer Email: {user.email}")
        y -= 15
        pdf.drawString(50, y, f"Total Amount: ₹{order.total_amount}")
        y -= 15
        pdf.drawString(50, y, f"Status: PROCESSING")
        y -= 15

        pdf.drawString(50, y, "Items:")
        y -= 15

        for item in items:
            pdf.drawString(
                70,
                y,
                f"- Product ID {item.product_id} | Qty {item.quantity} | Price ₹{item.price_at_purchase}"
            )
            y -= 15

        y -= 20
        if y < 100:
            pdf.showPage()
            y = height - 50

        order.order_status = "PROCESSING"

    db.commit()

    pdf.save()
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=order_batch.pdf"
        }
    )


# 3️⃣ PROCESSING → COMPLETED (STOCK DEDUCTION)
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

    # 🔒 TRANSACTION-SAFE STOCK DEDUCTION
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product {item.product_id} not found"
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product {product.id}"
                )

            product.stock -= item.quantity

        order.order_status = "COMPLETED"

    db.commit()

    return {
        "message": "Orders completed successfully",
        "completed_orders": order_ids
    }
