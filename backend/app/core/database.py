import uuid

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# Supabase Transaction Pooler (pgbouncer transaction mode) reuses server
# connections across clients. asyncpg always PREPAREs each statement; with the
# default name (`__asyncpg_stmt_N__`) those collide on the server side.
# Disable asyncpg's client cache AND give every prepared statement a unique
# name so collisions can't happen.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={
        "ssl": "require",
        "statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
        "server_settings": {
            "tcp_user_timeout": "10000",
        },
    },
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
