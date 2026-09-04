"""
Admin view of customer-reported issues.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.core.audit import log_admin_action
from app.core.notifications import notify_user
from app.db.session import get_db
from app.models.issue_report import IssueReport, IssueStatus
from app.models.notification import NotificationType
from app.models.user import User, UserRole
from app.schemas.issue_report import AdminIssueReportOut, IssueReportStatusUpdate

router = APIRouter(prefix="/api/v1/admin/issues", tags=["admin-issues"])
admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)


@router.get("", response_model=list[AdminIssueReportOut])
def list_issue_reports(
    status_filter: IssueStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    query = db.query(IssueReport)
    if status_filter is not None:
        query = query.filter(IssueReport.status == status_filter)
    return query.order_by(IssueReport.created_at.desc()).all()


@router.put("/{issue_id}/status", response_model=AdminIssueReportOut)
async def update_issue_report_status(
    issue_id: uuid.UUID,
    payload: IssueReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    report = db.get(IssueReport, issue_id)
    if report is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Issue report not found")

    previous_status = report.status
    report.status = payload.status
    if payload.admin_response is not None:
        report.admin_response = payload.admin_response.strip()

    log_admin_action(
        db,
        current_user,
        action="status_change",
        entity_type="issue_report",
        entity_id=str(report.id),
        description=f"Issue '{report.subject}': '{previous_status.value}' → '{payload.status.value}'",
    )

    db.commit()
    db.refresh(report)

    # Close the loop — the whole point of this feature is that a
    # customer who reported something hears back, not that the report
    # just quietly sits in an admin table.
    if payload.status != previous_status or payload.admin_response:
        await notify_user(
            db,
            user_id=report.user_id,
            title=f"Update on your reported issue: {report.subject}",
            message=report.admin_response or f"Status changed to {payload.status.value.replace('_', ' ')}",
            notification_type=NotificationType.GENERAL,
        )

    return report
