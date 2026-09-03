"""
Delivery partners and order tracking.

WHY "SIMULATE DELIVERY" IS JUST THE SAME admin_add_tracking_event
ENDPOINT, NOT A SEPARATE SIMULATION SYSTEM:
The brief asks for a "delivery partner simulation" to make tracking
understandable. Rather than building a separate fake background job that
advances orders on a timer (which would be more code, harder to test,
and not meaningfully more real), admins (or a seed/demo script) just call
this endpoint repeatedly with the next status in sequence — order_packed,
shipped, in_transit, out_for_delivery, delivered — same as a real
logistics integration would call it via webhook as a shipment actually
moves. The "simulation" IS the real endpoint; nothing about production
usage would differ.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.api.v1.deps import get_current_user, require_role
from app.core.audit import log_admin_action
from app.core.notifications import notify_user
from app.db.session import get_db
from app.models.delivery import DeliveryPartner, TrackingEvent, TrackingStatus
from app.models.notification import NotificationType
from app.models.order import Order
from app.models.user import User, UserRole
from app.schemas.delivery import (
    DeliveryPartnerCreate,
    DeliveryPartnerOut,
    DeliveryPartnerUpdate,
    TrackingEventCreate,
    TrackingEventOut,
)

router = APIRouter(tags=["delivery"])
admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)

_STATUS_LABELS: dict[TrackingStatus, str] = {
    TrackingStatus.ORDER_PACKED: "Your order has been packed",
    TrackingStatus.SHIPPED: "Your order has shipped",
    TrackingStatus.IN_TRANSIT: "Your order is in transit",
    TrackingStatus.OUT_FOR_DELIVERY: "Your order is out for delivery",
    TrackingStatus.DELIVERED: "Your order has been delivered",
}


# --- Admin: delivery partners ---
@router.post("/api/v1/admin/delivery-partners", response_model=DeliveryPartnerOut, status_code=status.HTTP_201_CREATED)
def create_delivery_partner(
    payload: DeliveryPartnerCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)
):
    partner = DeliveryPartner(**payload.model_dump())
    db.add(partner)
    db.flush()

    log_admin_action(
        db,
        current_user,
        action="create",
        entity_type="delivery_partner",
        entity_id=str(partner.id),
        description=f"Added delivery partner '{partner.name}'",
    )

    db.commit()
    db.refresh(partner)
    return partner


@router.get("/api/v1/admin/delivery-partners", response_model=list[DeliveryPartnerOut])
def list_delivery_partners(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return db.query(DeliveryPartner).order_by(DeliveryPartner.name).all()


@router.put("/api/v1/admin/delivery-partners/{partner_id}", response_model=DeliveryPartnerOut)
def update_delivery_partner(
    partner_id: uuid.UUID,
    payload: DeliveryPartnerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    partner = db.get(DeliveryPartner, partner_id)
    if partner is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Delivery partner not found")

    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(partner, field, value)

    if changes:
        log_admin_action(
            db,
            current_user,
            action="update",
            entity_type="delivery_partner",
            entity_id=str(partner.id),
            description=f"Updated delivery partner '{partner.name}' ({', '.join(changes.keys())})",
        )

    db.commit()
    db.refresh(partner)
    return partner


# --- Admin: add a tracking event (this is what advances/"simulates" a shipment) ---
@router.post(
    "/api/v1/admin/orders/{order_id}/tracking-events",
    response_model=TrackingEventOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_tracking_event(
    order_id: uuid.UUID,
    payload: TrackingEventCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    if payload.delivery_partner_id and db.get(DeliveryPartner, payload.delivery_partner_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Delivery partner not found")

    event = TrackingEvent(order_id=order_id, **payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)

    await notify_user(
        db,
        user_id=order.user_id,
        title=_STATUS_LABELS.get(payload.status, "Order update"),
        message=f"Order {order.order_number}: {event.location_label or payload.status.value.replace('_', ' ')}",
        notification_type=NotificationType.ORDER_UPDATE,
        related_order_id=order.id,
    )

    return event


# --- Customer: view tracking for their own order ---
@router.get("/api/v1/orders/{order_id}/tracking", response_model=list[TrackingEventOut])
def get_order_tracking(
    order_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    return (
        db.query(TrackingEvent)
        .filter(TrackingEvent.order_id == order_id)
        .options(selectinload(TrackingEvent.delivery_partner))
        .order_by(TrackingEvent.created_at.asc())
        .all()
    )
