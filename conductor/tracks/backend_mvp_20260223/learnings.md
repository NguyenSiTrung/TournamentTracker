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

## [2026-02-23] - Phase 3-5: Sessions, Games, Penalties, Stats, Data APIs
- **Implemented:** Full CRUD for Sessions, Games/Penalties with points calc, Scores, Leaderboard, Import/Export
- **Files changed:** backend/routers/sessions.py, games.py, stats.py, data.py, backend/tests/test_sessions.py, test_games_penalties.py, test_stats_data.py
- **Commits:** 2d5042d, 80a9d27, 8c71235
- **Learnings:**
  - Patterns: Extract shared helper `_get_session_or_404()` to DRY up session lookups
  - Patterns: Use `db.merge()` for import/upsert operations
  - Gotchas: SQLite DateTime column rejects ISO strings — must parse with `datetime.fromisoformat()` on import
  - Context: Export uses camelCase keys to match frontend localStorage format
---

## [2026-02-23] - Phase 6: Frontend Integration
- **Implemented:** API client module, async Store, refactored Teams/Session/History/App modules, localStorage migration tool
- **Files changed:** js/api.js (new), js/store.js, js/teams.js, js/session.js, js/history.js, js/app.js, index.html
- **Commit:** 195e4f0
- **Learnings:**
  - Patterns: API response uses snake_case (player_placements, team_player_map) — frontend must reference these keys not camelCase
  - Patterns: Use synchronous `getTeamFromCache()` in render loops to avoid async in .map() chains
  - Patterns: `Store.invalidateTeamsCache()` must be called after imports to force re-fetch
  - Gotchas: All public module functions that call Store must be async — cascading change through entire codebase
  - Context: CORS was already configured in Phase 1 via FastAPI middleware
---
