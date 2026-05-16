"""m005_add_note_document_type

Revision ID: m005doctype00
Revises: 9f53b1168c70
Create Date: 2026-05-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "m005doctype00"
down_revision: Union[str, None] = "9f53b1168c70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


VALID_DOC_TYPES = ("theory", "narrative", "procedure", "reference", "meeting", "freeform")


def upgrade() -> None:
    op.add_column(
        "notes",
        sa.Column(
            "document_type",
            sa.String(length=32),
            nullable=False,
            server_default="theory",
        ),
    )
    op.create_check_constraint(
        "ck_notes_document_type",
        "notes",
        f"document_type IN {VALID_DOC_TYPES!r}",
    )


def downgrade() -> None:
    op.drop_constraint("ck_notes_document_type", "notes", type_="check")
    op.drop_column("notes", "document_type")
