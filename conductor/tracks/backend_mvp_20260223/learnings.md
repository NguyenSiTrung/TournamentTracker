# Track Learnings: backend_mvp_20260223

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

<!-- No patterns yet - this is the first track -->

---

<!-- Learnings from implementation will be appended below -->

## [2026-02-23] - Phase 1: Backend Project Setup
- **Implemented:** FastAPI project structure, SQLAlchemy ORM models, Pydantic schemas
- **Files changed:** backend/main.py, backend/database/connection.py, backend/database/orm_models.py, backend/models/schemas.py, backend/tests/test_models.py, backend/requirements.txt
- **Commits:** c06764a, 7a9e752, 39eaef8
- **Learnings:**
  - Patterns: System Python is externally managed (PEP 668), must use venv
  - Patterns: Use `from_attributes=True` via `ConfigDict` for Pydantic v2 ORM mode
  - Patterns: JSON columns in SQLAlchemy work well for flexible dict/list fields (players, team_ids, points)
  - Gotchas: `check_same_thread=False` required for SQLite with FastAPI
  - Context: Points calculation: 1st=4, 2nd=3, 3rd=2, 4th+=1 (matches store.js)
---

## [2026-02-23] - Phase 2: Teams API
- **Implemented:** Full CRUD for Teams (GET list, GET by id, POST, PUT, DELETE)
- **Files changed:** backend/routers/teams.py, backend/main.py, backend/tests/conftest.py, backend/tests/test_teams.py
- **Commit:** 95835cf
- **Learnings:**
  - Patterns: Use `StaticPool` + `check_same_thread=False` for SQLite in-memory test engines (FastAPI runs handlers in threadpool)
  - Patterns: Test fixture: override `get_db` dependency, create fresh engine per test via `client` fixture
  - Gotchas: `ASGITransport` is async-only; use `starlette.testclient.TestClient` for sync FastAPI tests
  - Gotchas: Must import ORM models in conftest to ensure they're registered with `Base.metadata`
---
