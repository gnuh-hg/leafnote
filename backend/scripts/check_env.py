"""Validate Leafnote backend env vars against Supabase project.

Usage (from backend/):
    python -m scripts.check_env

Checks performed (NO secrets are printed):
  - All required vars present
  - SUPABASE_SERVICE_ROLE_KEY is a JWT with role=service_role and matches SUPABASE_URL project ref
  - DATABASE_URL points at pooler:6543, user matches project ref
  - DATABASE_DIRECT_URL points at pooler:5432, user matches project ref
  - SUPABASE_URL JWKS endpoint reachable, returns ES256 keys
  - Both DB URLs can open a connection and run `select 1`
"""
from __future__ import annotations

import asyncio
import base64
import json
import re
import sys
from urllib.parse import urlparse

import httpx
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

from app.core.config import settings


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

results: list[tuple[bool, str]] = []


def check(ok: bool, label: str) -> None:
    results.append((ok, label))
    mark = f"{GREEN}OK{RESET}" if ok else f"{RED}FAIL{RESET}"
    print(f"  [{mark}] {label}")


def decode_jwt_payload(token: str) -> dict | None:
    try:
        _, payload_b64, _ = token.split(".")
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        return json.loads(base64.urlsafe_b64decode(padded))
    except Exception:
        return None


def extract_ref_from_url(url: str) -> str | None:
    m = re.match(r"https://([a-z0-9]+)\.supabase\.co", url)
    return m.group(1) if m else None


def extract_user_ref(db_url: str) -> str | None:
    parsed = urlparse(db_url)
    user = parsed.username or ""
    if "." in user:
        return user.split(".", 1)[1]
    return None


async def probe_db(url: str, label: str) -> None:
    try:
        connect_args = {"ssl": "require", "statement_cache_size": 0}
        if ":6543" in url:
            import uuid
            connect_args["prepared_statement_name_func"] = (
                lambda: f"__asyncpg_{uuid.uuid4().hex}__"
            )
        engine = create_async_engine(url, connect_args=connect_args)
        async with engine.connect() as conn:
            result = await conn.execute(text("select 1"))
            value = result.scalar()
        await engine.dispose()
        check(value == 1, f"{label}: connection + 'select 1' succeeds")
    except Exception as e:
        check(False, f"{label}: connection failed ({type(e).__name__}: {str(e)[:120]})")


async def probe_leaf_engine() -> None:
    if not settings.LEAF_ENGINE_URL:
        check(False, "LEAF_ENGINE_URL not set (engine features disabled)")
        return
    check(bool(settings.LEAF_ENGINE_API_KEY), "LEAF_ENGINE_API_KEY present")
    check(bool(settings.LEAF_ENGINE_MODEL), "LEAF_ENGINE_MODEL present")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Reachability ping — không gọi chat completions thật vì tốn token.
            resp = await client.get(settings.LEAF_ENGINE_URL.rsplit("/", 1)[0])
        check(resp.status_code < 500,
              f"LEAF_ENGINE_URL host reachable (HTTP {resp.status_code})")
    except Exception as e:
        check(False, f"LEAF_ENGINE_URL probe failed ({type(e).__name__}: {str(e)[:120]})")


async def probe_jwks() -> None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json",
                timeout=10,
            )
        ok_status = resp.status_code == 200
        check(ok_status, f"JWKS endpoint reachable (HTTP {resp.status_code})")
        if not ok_status:
            return
        keys = resp.json().get("keys", [])
        check(len(keys) > 0, f"JWKS returns at least one key ({len(keys)} found)")
        algs = {k.get("alg") for k in keys}
        check("ES256" in algs, f"JWKS contains an ES256 key (algs={sorted(algs)})")
    except Exception as e:
        check(False, f"JWKS probe failed ({type(e).__name__}: {str(e)[:120]})")


async def main() -> int:
    print(f"{YELLOW}== Leafnote env check =={RESET}")

    # Project ref from URL
    url_ref = extract_ref_from_url(settings.SUPABASE_URL)
    check(bool(url_ref), f"SUPABASE_URL is https://<ref>.supabase.co (ref={url_ref})")

    # service_role JWT
    sr_payload = decode_jwt_payload(settings.SUPABASE_SERVICE_ROLE_KEY)
    if sr_payload is None:
        check(False, "SUPABASE_SERVICE_ROLE_KEY is a JWT (3 dot-separated parts)")
    else:
        check(sr_payload.get("role") == "service_role",
              f"SUPABASE_SERVICE_ROLE_KEY has role=service_role (got {sr_payload.get('role')!r})")
        check(sr_payload.get("ref") == url_ref,
              f"SUPABASE_SERVICE_ROLE_KEY ref matches URL (key_ref={sr_payload.get('ref')!r})")

    # Legacy HS256 secret — sanity only (cannot decode, but must not be a JWT)
    jwt_secret = settings.SUPABASE_JWT_SECRET
    check(not jwt_secret.startswith("eyJ"),
          "SUPABASE_JWT_SECRET is the Legacy HS256 shared secret (not a JWT)")
    check(len(jwt_secret) >= 32,
          f"SUPABASE_JWT_SECRET length looks reasonable (>= 32, got {len(jwt_secret)})")

    # DATABASE_URL — transaction pooler
    db_url = settings.DATABASE_URL
    check(db_url.startswith("postgresql+asyncpg://"),
          "DATABASE_URL uses postgresql+asyncpg:// driver")
    check(":6543" in db_url and "pooler.supabase.com" in db_url,
          "DATABASE_URL points at Transaction Pooler (host=*.pooler.supabase.com, port=6543)")
    check(extract_user_ref(db_url) == url_ref,
          f"DATABASE_URL user ref matches project ref (got {extract_user_ref(db_url)!r})")

    # DATABASE_DIRECT_URL — session pooler
    direct_url = settings.DATABASE_DIRECT_URL
    check(direct_url.startswith("postgresql+asyncpg://"),
          "DATABASE_DIRECT_URL uses postgresql+asyncpg:// driver")
    check(":5432" in direct_url,
          "DATABASE_DIRECT_URL uses port 5432 (Session Pooler or Direct)")
    check(extract_user_ref(direct_url) == url_ref,
          f"DATABASE_DIRECT_URL user ref matches project ref (got {extract_user_ref(direct_url)!r})")

    # Live probes
    await probe_jwks()
    await probe_leaf_engine()
    await probe_db(db_url, "DATABASE_URL")
    await probe_db(direct_url, "DATABASE_DIRECT_URL")

    failed = [label for ok, label in results if not ok]
    print()
    if failed:
        print(f"{RED}{len(failed)} check(s) failed:{RESET}")
        for label in failed:
            print(f"  - {label}")
        return 1
    print(f"{GREEN}All checks passed.{RESET}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
