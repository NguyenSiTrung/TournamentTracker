# Learnings: Edit Team Modal Redesign + Team Identity System

## [2026-02-26 13:21] - Phase 1: Backend — Team Identity Fields
- **Implemented:** Added `color` and `tag` columns to Team ORM model, updated Pydantic schemas, router endpoints, and migration logic
- **Files changed:** `backend/database/orm_models.py`, `backend/models/schemas.py`, `backend/routers/teams.py`, `backend/main.py`, `backend/tests/test_teams.py`
- **Commit:** 206d39c
- **Learnings:**
  - Patterns: SQLite `create_all()` won't ALTER existing tables — must manually add columns with ALTER TABLE for existing DBs
  - Gotchas: Migration function using `get_db()` generator fails in tests because test fixture overrides happen after app startup; use `SessionLocal()` directly instead
  - Gotchas: Must check `inspector.has_table()` before attempting ALTER TABLE, otherwise fresh DBs (which already have correct schema from create_all) get errors
  - Context: TEAM_COLOR_PALETTE defined in `main.py` — 8 colors must match frontend TEAM_COLORS array

---

## [2026-02-26 13:21] - Phase 2: Frontend — API & Store Layer
- **Implemented:** Updated `API.createTeam()`, `API.updateTeam()`, `Store.createTeam()`, `Store.updateTeam()` to accept and forward `color` and `tag` parameters
- **Files changed:** `js/api.js`, `js/store.js`
- **Commit:** c7804e6
- **Learnings:**
  - Patterns: Default parameter values (`= null`) maintain backward compat — existing callers without color/tag still work
  - Context: Store wraps API with team caching; both layers need matching signatures

---

## [2026-02-26 13:21] - Phase 3: Frontend — Edit Team Modal Redesign
- **Implemented:** Extracted `buildTeamFormBody(team?)`, `buildTeamFormFooter(mode)`, `_setupModalHeader(title, subtitle)` shared functions. Refactored both Create and Edit modals to use them.
- **Files changed:** `js/teams.js`
- **Commit:** 65f10b0
- **Learnings:**
  - Patterns: `buildTeamFormBody(null)` for create, `buildTeamFormBody(team)` for edit — optional param pattern elegant for DRY
  - Patterns: `_setupModalHeader()` with setTimeout(50ms) needed because modal DOM isn't ready immediately after `App.openModal()`
  - Gotchas: Color swatch active state must match on hex value equality, not index — team's stored color may not be at the same index
  - Context: Both modals now use `modalClass: 'modal-create-team'` CSS variant

---

## [2026-02-26 13:21] - Phase 4: Team Cards — Stored Identity Display
- **Implemented:** Team cards now use stored `team.color` for avatar gradient and accent stripe. Tag badge displayed next to team name with accent-colored styling.
- **Files changed:** `js/teams.js`, `css/style.css`
- **Commit:** 0d860af
- **Learnings:**
  - Patterns: `_darkenHex(hex, 30)` generates darker gradient endpoints from stored color — eliminates need for pre-computed gradient pairs
  - Patterns: Inline CSS with hex + alpha suffix (e.g., `${color}20`) works for tag badge backgrounds — no need for separate rgba conversion
  - Gotchas: `.team-name` margin moved from `.team-name` to `.team-name-row` wrapper to accommodate tag badge layout; must check for regressions in other contexts using `.team-name`
  - Context: Fallback to `TEAM_ACCENT_COLORS[idx % length]` still works for teams without stored color

---
