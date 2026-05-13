---
name: debug
description: "Debugging workflow for Leafnote. Use when tracking down a bug in React frontend or FastAPI backend. Covers console errors, network tab, backend logs, and common Leafnote-specific failure patterns."
---

# Debug — Leafnote

## Frontend (React + Vite)

```
1. Open Chrome DevTools → Console tab
   - Filter out Vite HMR noise: exclude "[vite]" in console filter
   - Look for red errors and unhandled promise rejections

2. Network tab
   - Filter: XHR/Fetch
   - Red = failed request → check status code + response body
   - 401 → token expired or missing (check localStorage: access_token)
   - 403 → wrong user_id or missing auth header
   - 422 → Pydantic validation error (check response JSON for detail[])

3. Application tab → Local Storage
   - access_token present?
   - user_id matches what the API expects?
```

## Common Leafnote Frontend Bugs

| Symptom | Likely cause |
|---|---|
| Page shows spinner forever | fetchWithAuth threw but error not caught |
| Redirect to /auth unexpectedly | 401 response → authStore cleared session |
| Toast doesn't appear | showError() not called, or toast limit (5) hit |
| i18n shows key not string | Missing key in vi.json or en.json |
| IDB data stale | `initDB()` called before `registerStore()` |

## Backend (FastAPI + uvicorn)

```
1. Check terminal running uvicorn — traceback appears there
2. Common patterns:
   - MissingGreenlet → lazy loading in async context → add selectinload()
   - 422 Unprocessable Entity → schema mismatch, check schemas/*.py
   - IntegrityError → duplicate key or FK violation
   - AttributeError on None → scalar_one_or_none() returned None, forgot 404 check
```

## Auth Flow Debug

```python
# Decode JWT locally to inspect claims:
import jwt
payload = jwt.decode(token, options={"verify_signature": False})
print(payload)  # check sub, exp, role
```

## Quick Check Commands

```powershell
# Backend: is the server running?
curl http://localhost:8000/health

# Frontend: check Vite dev server
curl http://localhost:5173

# Check backend logs live (if using uvicorn --reload)
# Just watch the terminal — all request logs appear there
```
