"""
Customer-facing "Report an Issue" endpoints.

Every report is tied to the authenticated user (see deps.get_current_user)
so there's always a real account to follow up with — an anonymous report
with no way to contact the reporter back defeats the point of this
feature existing at all.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.issue_report import IssueReport
from app.models.user import User
from app.schemas.issue_report import IssueReportCreate, IssueReportOut

router = APIRouter(prefix="/api/v1/issues", tags=["issues"])


@router.post("", response_model=IssueReportOut, status_code=201)
def create_issue_report(
    payload: IssueReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = IssueReport(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_email=current_user.email,
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[IssueReportOut])
def list_my_issue_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(IssueReport)
        .filter(IssueReport.user_id == current_user.id)
        .order_by(IssueReport.created_at.desc())
        .all()
    )
