"""add issue_reports

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'issue_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_name', sa.String(length=150), nullable=False),
        sa.Column('user_email', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=120), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column(
            'status',
            postgresql.ENUM('open', 'in_progress', 'resolved', name='issue_status'),
            nullable=False,
        ),
        sa.Column('admin_response', sa.Text(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_issue_reports_user_id'), 'issue_reports', ['user_id'], unique=False)
    op.create_index(op.f('ix_issue_reports_status'), 'issue_reports', ['status'], unique=False)
    op.create_index(op.f('ix_issue_reports_created_at'), 'issue_reports', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_issue_reports_created_at'), table_name='issue_reports')
    op.drop_index(op.f('ix_issue_reports_status'), table_name='issue_reports')
    op.drop_index(op.f('ix_issue_reports_user_id'), table_name='issue_reports')
    op.drop_table('issue_reports')
    op.execute('DROP TYPE IF EXISTS issue_status')
