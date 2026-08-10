from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.banner import Banner

router = APIRouter(
    prefix="/api/v1/admin/banners",
    tags=["admin-banners"],
)

admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)


@router.get("")
def get_banners(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    banners = (
        db.query(Banner)
        .order_by(Banner.created_at.desc())
        .all()
    )

    return banners