
"""
Read-only view of the audit log. Nothing is ever created/edited
through this router — entries are written by log_admin_action() from
inside the mutation endpoints that actually change something.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.schemas.admin import AuditLogOut

router = APIRouter(prefix="/api/v1/admin/audit-log", tags=["admin-audit-log"])
admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)


@router.get("", response_model=list[AuditLogOut])
def list_audit_log(
    entity_type: str | None = Query(default=None),
    action: str | None = Query(default=None),
    q: str | None = Query(default=None, description="Search description/admin name"),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    query = db.query(AuditLog)

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    if action:
        query = query.filter(AuditLog.action == action)

    if q:
        like_pattern = f"%{q.strip()}%"
        query = query.filter(
            AuditLog.description.ilike(like_pattern) | AuditLog.admin_name.ilike(like_pattern)
        )

    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
