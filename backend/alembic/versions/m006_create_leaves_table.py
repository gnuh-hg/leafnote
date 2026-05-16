"""m006_create_leaves_table

Revision ID: m006leaves000
Revises: m005doctype00
Create Date: 2026-05-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "m006leaves000"
down_revision: Union[str, None] = "m005doctype00"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


VALID_LEAF_TYPES = ("definition", "fact", "example", "question", "note")


def upgrade() -> None:
    op.create_table(
        "leaves",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("note_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("type", sa.String(length=32), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column(
            "user_edited", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            f"type IN {VALID_LEAF_TYPES!r}", name="ck_leaves_type"
        ),
    )
    op.create_index("ix_leaves_note_id", "leaves", ["note_id"])
    op.create_index(
        "ix_leaves_user_created", "leaves", ["user_id", "created_at"]
    )

    op.create_table(
        "leaf_feedback",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("leaf_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("rating", sa.String(length=8), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["leaf_id"], ["leaves.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("rating IN ('up','down')", name="ck_leaf_feedback_rating"),
    )
    op.create_index("ix_leaf_feedback_leaf_id", "leaf_feedback", ["leaf_id"])


def downgrade() -> None:
    op.drop_index("ix_leaf_feedback_leaf_id", table_name="leaf_feedback")
    op.drop_table("leaf_feedback")
    op.drop_index("ix_leaves_user_created", table_name="leaves")
    op.drop_index("ix_leaves_note_id", table_name="leaves")
    op.drop_table("leaves")
