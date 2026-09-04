import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.issue_report import IssueStatus


class IssueReportCreate(BaseModel):
    subject: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=5, max_length=2000)


class IssueReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject: str
    message: str
    status: IssueStatus
    admin_response: str | None
    created_at: datetime
    updated_at: datetime


class AdminIssueReportOut(IssueReportOut):
    user_name: str
    user_email: str


class IssueReportStatusUpdate(BaseModel):
    status: IssueStatus
    admin_response: str | None = Field(default=None, max_length=2000)
