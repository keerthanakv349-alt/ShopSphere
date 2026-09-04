"""
Customer-reported issues ("Report an Issue" on the storefront).

WHY user_name / user_email ARE SNAPSHOTTED HERE TOO:
Same reasoning as Order/OrderItem and AuditLog — the admin issue list
needs to show who reported what without a join, and stays readable
even if that account is later renamed. Unlike an order, there's no
"price at the time" to protect, but the same "don't lose the story to
a later edit" logic applies.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import GUID, pg_enum


class IssueStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class IssueReport(Base):
    __tablename__ = "issue_reports"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_name: Mapped[str] = mapped_column(String(150), nullable=False)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)

    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[IssueStatus] = mapped_column(
        pg_enum(IssueStatus, name="issue_status"), default=IssueStatus.OPEN, nullable=False, index=True
    )
    admin_response: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
