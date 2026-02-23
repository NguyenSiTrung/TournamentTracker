# Codebase Patterns

Reusable patterns discovered during development. Read this before starting new work.

---

## Code Conventions

- API responses use snake_case keys; frontend JS converts to camelCase where needed (from: backend_mvp_20260223, 2026-02-23)
- Use `from_attributes=True` via Pydantic `ConfigDict` for ORM mode in response schemas (from: backend_mvp_20260223, 2026-02-23)
- Use `escapeHtml()` for all user-provided content rendered via innerHTML (from: backend_mvp_20260223, 2026-02-23)

## Architecture

- Store module wraps API client with team caching; use `getTeamFromCache()` for sync lookups in render loops (from: backend_mvp_20260223, 2026-02-23)
- FastAPI routers: one file per resource in `backend/routers/`, shared helpers like `_get_session_or_404()` for DRY (from: backend_mvp_20260223, 2026-02-23)
- Use `db.merge()` for import/upsert operations (from: backend_mvp_20260223, 2026-02-23)

## Gotchas

- System Python is externally managed (PEP 668) — always use venv (from: backend_mvp_20260223, 2026-02-23)
- SQLite requires `check_same_thread=False` with FastAPI (from: backend_mvp_20260223, 2026-02-23)
- SQLite DateTime column rejects ISO strings — parse with `datetime.fromisoformat()` on import (from: backend_mvp_20260223, 2026-02-23)
- `ASGITransport` is async-only; use `starlette.testclient.TestClient` for sync FastAPI tests (from: backend_mvp_20260223, 2026-02-23)
- All module functions calling async Store must themselves be async — cascading change (from: backend_mvp_20260223, 2026-02-23)

## Testing

- Use `StaticPool` + `check_same_thread=False` for SQLite in-memory test engines (from: backend_mvp_20260223, 2026-02-23)
- Override FastAPI `get_db` dependency in test fixtures with fresh in-memory engine per test (from: backend_mvp_20260223, 2026-02-23)
- Import all ORM models in `conftest.py` to ensure they're registered with `Base.metadata` (from: backend_mvp_20260223, 2026-02-23)
- Points calculation: 1st=4, 2nd=3, 3rd=2, 4th+=1; 2 players: 1st=4, 2nd=1 (from: backend_mvp_20260223, 2026-02-23)

---
Last refreshed: 2026-02-23
