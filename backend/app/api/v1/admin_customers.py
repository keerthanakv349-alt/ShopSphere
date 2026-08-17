import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.api.v1.deps import require_role
from app.db.session import get_db
from app.models.address import Address
from app.models.order import Order
from app.models.payment import Payment, PaymentStatus
from app.models.user import User, UserRole
from app.schemas.admin import AdminCustomerDetail

router = APIRouter(
    prefix="/api/v1/admin/customers",
    tags=["admin-customers"],
)

admin_only = require_role(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
)


@router.get(
    "/{customer_id}",
    response_model=AdminCustomerDetail,
)
def get_customer_detail(
    customer_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    # ---------------------------------------------------------
    # 1. Find the customer
    # ---------------------------------------------------------
    customer = (
        db.query(User)
        .filter(
            User.id == customer_id,
            User.role == UserRole.CUSTOMER,
        )
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    # ---------------------------------------------------------
    # 2. Get customer addresses
    # ---------------------------------------------------------
    addresses = (
        db.query(Address)
        .filter(Address.user_id == customer.id)
        .order_by(
            Address.is_default.desc(),
            Address.created_at.desc(),
        )
        .all()
    )

    # ---------------------------------------------------------
    # 3. Get customer's orders
    # ---------------------------------------------------------
    orders = (
        db.query(Order)
        .filter(Order.user_id == customer.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )

    # ---------------------------------------------------------
    # 4. Calculate total orders
    # ---------------------------------------------------------
    total_orders = len(orders)

    # ---------------------------------------------------------
    # 5. Calculate actual money spent
    #
    # Only successful payments count as customer spending.
    # Pending/failed payments are not counted.
    # ---------------------------------------------------------
    total_spend = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .join(Order, Payment.order_id == Order.id)
        .filter(
            Order.user_id == customer.id,
            Payment.status == PaymentStatus.PAID,
        )
        .scalar()
    )

    if total_spend is None:
        total_spend = Decimal("0.00")

    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone_number": customer.phone_number,
        "role": customer.role,
        "is_active": customer.is_active,
        "is_email_verified": customer.is_email_verified,
        "created_at": customer.created_at,
        "addresses": addresses,
        "total_orders": total_orders,
        "total_spend": total_spend,
        "orders": orders,
    }