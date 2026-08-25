
    
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.banner import Banner


router = APIRouter(
    prefix="/api/v1/banners",
    tags=["banners"],
)


@router.get("")
def get_active_banners(
    db: Session = Depends(get_db),
):
    return (
        db.query(Banner)
        .filter(Banner.is_active.is_(True))
        .order_by(
            Banner.display_order.asc(),
            Banner.created_at.desc(),
        )
        .all()
    )