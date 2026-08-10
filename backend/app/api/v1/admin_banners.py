from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.db.session import get_db
from app.models.banner import Banner
from app.models.user import User, UserRole
from app.schemas.admin import BannerCreate, BannerOut, BannerUpdate


router = APIRouter(
    prefix="/api/v1/admin/banners",
    tags=["admin-banners"],
)

admin_only = require_role(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
)


@router.post(
    "",
    response_model=BannerOut,
    status_code=status.HTTP_201_CREATED,
)
def create_banner(
    payload: BannerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    banner = Banner(
        **payload.model_dump()
    )

    db.add(banner)
    db.commit()
    db.refresh(banner)

    return banner


@router.get(
    "",
    response_model=list[BannerOut],
)
def list_banners(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    return (
        db.query(Banner)
        .order_by(Banner.display_order.asc(), Banner.created_at.desc())
        .all()
    )


@router.get(
    "/{banner_id}",
    response_model=BannerOut,
)
def get_banner(
    banner_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    banner = (
        db.query(Banner)
        .filter(Banner.id == banner_id)
        .first()
    )

    if banner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found",
        )

    return banner


@router.put(
    "/{banner_id}",
    response_model=BannerOut,
)
def update_banner(
    banner_id: str,
    payload: BannerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    banner = (
        db.query(Banner)
        .filter(Banner.id == banner_id)
        .first()
    )

    if banner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(banner, field, value)

    db.commit()
    db.refresh(banner)

    return banner


@router.delete(
    "/{banner_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_banner(
    banner_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    banner = (
        db.query(Banner)
        .filter(Banner.id == banner_id)
        .first()
    )

    if banner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found",
        )

    db.delete(banner)
    db.commit()

    return None