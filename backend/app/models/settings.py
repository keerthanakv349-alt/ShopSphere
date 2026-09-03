"""
Store settings — a single-row table holding the admin-configurable
knobs that used to be hardcoded constants scattered across the
codebase (default shipping charge, low-stock threshold, store contact
info, currency, maintenance mode).

WHY A SINGLE-ROW TABLE INSTEAD OF A GENERIC KEY-VALUE STORE:
A generic `settings(key, value)` table is more "flexible" but trades
away type safety and validation — every read becomes "parse this
string and hope it's still a valid int." Since this store has a known,
small, fixed set of fields, a real table with real column types (and a
CHECK-free but Pydantic-validated update schema) is simpler to use
correctly and lets the database itself guarantee shapes.

WHY THERE'S ALWAYS EXACTLY ONE ROW:
There is one store, so there is one settings row, with a fixed id of 1.
`get_or_create_settings()` is the only sanctioned way to read/write it —
it creates the default row on first use so a fresh install doesn't need
a special seed step just for this table.
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, Session

from app.db.base import Base


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    store_name: Mapped[str] = mapped_column(String(150), default="ShopSphere", nullable=False)
    support_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    support_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    currency_code: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    default_shipping_charge: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("50.00"), nullable=False
    )
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


_SETTINGS_ROW_ID = 1


def get_or_create_settings(db: Session) -> StoreSettings:
    """
    Return the one settings row, creating it with defaults if this is
    the first time anything has read/written settings.
    """
    settings_row = db.get(StoreSettings, _SETTINGS_ROW_ID)

    if settings_row is None:
        settings_row = StoreSettings(id=_SETTINGS_ROW_ID)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)

    return settings_row
