"""
Customer-facing "My Coupons" — browse currently usable discount codes.

WHY THIS IS "CURRENTLY VALID COUPONS", NOT "COUPONS ASSIGNED TO ME":
There's no per-customer coupon targeting in this schema (see
app/models/coupon.py) — a coupon is either usable by anyone right now or
it isn't. So "my coupons" means exactly that: whatever any customer could
successfully apply at checkout right now, computed with the same
is_active/date-window/usage-limit rules cart.py's apply-coupon endpoint
enforces, kept here as one query so the two can't quietly disagree.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.order import CouponOut

router = APIRouter(prefix="/api/v1/coupons", tags=["coupons"])


@router.get("/active", response_model=list[CouponOut])
def list_active_coupons(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)

    coupons = (
        db.query(Coupon)
        .filter(
            Coupon.is_active.is_(True),
            or_(Coupon.valid_from.is_(None), Coupon.valid_from <= now),
            or_(Coupon.valid_until.is_(None), Coupon.valid_until >= now),
        )
        .order_by(Coupon.created_at.desc())
        .all()
    )

    # usage_limit is checked in Python, not SQL — comparing two columns
    # (times_used < usage_limit) needs no special handling here since
    # both are plain ints, but keeping the "unlimited when usage_limit is
    # NULL" logic explicit is clearer than a SQL NULL-comparison trick.
    return [c for c in coupons if c.usage_limit is None or c.times_used < c.usage_limit]
