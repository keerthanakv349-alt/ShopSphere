"""add wishlist

Revision ID: 1e23b1606022
Revises: 304fb6eed585
Create Date: 2026-08-18

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.db.types import GUID


# revision identifiers, used by Alembic.
revision: str = "1e23b1606022"
down_revision: Union[str, None] = "304fb6eed585"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create the wishlist_items table.

    Only Wishlist-related database changes belong in this migration.
    """

    op.create_table(
        "wishlist_items",

        sa.Column(
            "id",
            GUID(),
            nullable=False,
        ),

        sa.Column(
            "user_id",
            GUID(),
            nullable=False,
        ),

        sa.Column(
            "product_id",
            GUID(),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_wishlist_user_product",
        ),
    )

    op.create_index(
        "ix_wishlist_items_user_id",
        "wishlist_items",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_wishlist_items_product_id",
        "wishlist_items",
        ["product_id"],
        unique=False,
    )


def downgrade() -> None:
    """
    Remove the wishlist table.
    """

    op.drop_index(
        "ix_wishlist_items_product_id",
        table_name="wishlist_items",
    )

    op.drop_index(
        "ix_wishlist_items_user_id",
        table_name="wishlist_items",
    )

    op.drop_table("wishlist_items")