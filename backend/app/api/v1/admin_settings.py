"""
Site settings — the admin-configurable store-wide knobs (shipping
charge, low-stock threshold, contact info, currency, maintenance mode)
that used to be hardcoded constants. See app/models/settings.py for
why this is one single-row table rather than a generic key-value store.
"""
from fastapi import APIRouter, Depends

from app.api.v1.deps import require_role
from app.core.audit import log_admin_action
from app.db.session import get_db
from app.models.settings import get_or_create_settings
from app.models.user import User, UserRole
from app.schemas.admin import SiteSettingsOut, SiteSettingsUpdate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/admin/settings", tags=["admin-settings"])
admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)


@router.get("", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return get_or_create_settings(db)


@router.put("", response_model=SiteSettingsOut)
def update_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    settings_row = get_or_create_settings(db)

    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(settings_row, field, value)

    if changes:
        log_admin_action(
            db,
            current_user,
            action="update",
            entity_type="settings",
            entity_id=None,
            description=f"Updated store settings ({', '.join(changes.keys())})",
        )

    db.commit()
    db.refresh(settings_row)
    return settings_row
