"""
Wishlist table.

Each row represents one product saved by one customer.

DATA INTEGRITY:
- user_id references users.id.
- product_id references products.id.
- Deleting a user removes that user's wishlist items.
- Deleting a product removes its wishlist items.
- A unique constraint prevents duplicate wishlist entries.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_wishlist_user_product",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(
        back_populates="wishlist_items",
    )

    product: Mapped["Product"] = relationship(
        back_populates="wishlist_items",
    )