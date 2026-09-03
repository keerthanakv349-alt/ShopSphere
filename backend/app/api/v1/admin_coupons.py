

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.core.audit import log_admin_action
from app.db.session import get_db
from app.models.coupon import Coupon
from app.models.user import User, UserRole
from app.schemas.order import CouponCreate, CouponOut


router = APIRouter(
    prefix="/api/v1/admin/coupons",
    tags=["admin-coupons"],
)

admin_only = require_role(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
)


@router.post(
    "",
    response_model=CouponOut,
    status_code=status.HTTP_201_CREATED,
)
def create_coupon(
    payload: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    code = payload.code.upper()

    if db.query(Coupon).filter(Coupon.code == code).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists",
        )

    coupon = Coupon(
        **{
            **payload.model_dump(),
            "code": code,
        }
    )

    db.add(coupon)
    db.flush()

    log_admin_action(
        db,
        current_user,
        action="create",
        entity_type="coupon",
        entity_id=str(coupon.id),
        description=f"Created coupon '{coupon.code}'",
    )

    db.commit()
    db.refresh(coupon)

    return coupon


@router.get(
    "",
    response_model=list[CouponOut],
)
def list_coupons(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    return (
        db.query(Coupon)
        .order_by(Coupon.created_at.desc())
        .all()
    )


@router.put(
    "/{coupon_id}",
    response_model=CouponOut,
)
def update_coupon(
    coupon_id: str,
    payload: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    coupon = (
        db.query(Coupon)
        .filter(Coupon.id == coupon_id)
        .first()
    )

    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )

    code = payload.code.upper()

    existing = (
        db.query(Coupon)
        .filter(
            Coupon.code == code,
            Coupon.id != coupon_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists",
        )

    for field, value in payload.model_dump().items():
        setattr(coupon, field, value)

    coupon.code = code

    log_admin_action(
        db,
        current_user,
        action="update",
        entity_type="coupon",
        entity_id=str(coupon.id),
        description=f"Updated coupon '{coupon.code}'",
    )

    db.commit()
    db.refresh(coupon)

    return coupon


@router.put(
    "/{coupon_id}/status",
    response_model=CouponOut,
)
def update_coupon_status(
    coupon_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    coupon = (
        db.query(Coupon)
        .filter(Coupon.id == coupon_id)
        .first()
    )

    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )

    coupon.is_active = is_active

    log_admin_action(
        db,
        current_user,
        action="status_change",
        entity_type="coupon",
        entity_id=str(coupon.id),
        description=f"{'Activated' if is_active else 'Deactivated'} coupon '{coupon.code}'",
    )

    db.commit()
    db.refresh(coupon)

    return coupon


@router.delete(
    "/{coupon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_coupon(
    coupon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    coupon = (
        db.query(Coupon)
        .filter(Coupon.id == coupon_id)
        .first()
    )

    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )

    log_admin_action(
        db,
        current_user,
        action="delete",
        entity_type="coupon",
        entity_id=str(coupon.id),
        description=f"Deleted coupon '{coupon.code}'",
    )

    db.delete(coupon)
    db.commit()

    return None