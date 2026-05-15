"""change_note_body_to_text

Revision ID: 9f53b1168c70
Revises: m004notes000
Create Date: 2026-05-14 22:32:28.914863

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f53b1168c70'
down_revision: Union[str, None] = 'm004notes000'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add a temporary column to store the new body text
    op.add_column("notes", sa.Column("body_text", sa.Text(), nullable=True))
    
    # 2. Populate the new column from the existing plain_text column
    # In the current implementation, plain_text already contains the flattened JSON body
    op.execute("UPDATE notes SET body_text = plain_text")
    
    # 3. Set the new column as NOT NULL after population
    op.alter_column("notes", "body_text", nullable=False, server_default="")
    
    # 4. Drop the old JSONB body column
    op.drop_column("notes", "body")
    
    # 5. Rename the new column to 'body'
    op.alter_column("notes", "body_text", new_column_name="body")


def downgrade() -> None:
    # 1. Add a temporary column for JSONB
    from sqlalchemy.dialects import postgresql
    op.add_column("notes", sa.Column("body_json", postgresql.JSONB(), nullable=True))
    
    # 2. Convert plain text back to a simple BlockNote structure (one paragraph block)
    # [{"type": "paragraph", "content": [{"type": "text", "text": body}]}]
    op.execute("""
        UPDATE notes 
        SET body_json = json_build_array(
            json_build_object(
                'type', 'paragraph', 
                'content', json_build_array(
                    json_build_object('type', 'text', 'text', body)
                )
            )
        )::jsonb
    """)
    
    # 3. Set as NOT NULL
    op.alter_column("notes", "body_json", nullable=False, server_default="[]")
    
    # 4. Drop the TEXT body column
    op.drop_column("notes", "body")
    
    # 5. Rename back to 'body'
    op.alter_column("notes", "body_json", new_column_name="body")
