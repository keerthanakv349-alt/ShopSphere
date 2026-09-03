"""
Audit log — a append-only record of admin actions.

WHY entity_id IS A PLAIN STRING, NOT A FOREIGN KEY:
A single audit log spans many different tables (products, orders,
users, coupons, settings, delivery partners...). A real FK would need a
separate nullable column per referenced table, which grows every time
a new entity type gets audited. entity_type + entity_id (string form
of whatever the real PK is) is the standard "polymorphic reference"
tradeoff: you lose DB-level referential integrity on this one column,
in exchange for one small table that can log absolutely anything.

WHY admin_name IS SNAPSHOTTED RATHER THAN JOINED FROM `users`:
Same reasoning as Order/OrderItem (see models/order.py) — a log entry
must keep reading correctly ("Jane Doe deactivated user X") even if
the admin's own name changes later, so the name is copied in at write
time, not looked up live.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import GUID


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)

    admin_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    admin_name: Mapped[str] = mapped_column(String(150), nullable=False)

    # e.g. "create", "update", "delete", "status_change"
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # e.g. "product", "order", "user", "coupon", "settings", "delivery_partner"
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Human-readable summary, e.g. "Changed price of 'Air Runner
    # Sneakers' from ₹6999.00 to ₹5999.00"
    description: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
