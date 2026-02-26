# Track Learnings: settings_tab_redesign_20260226

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- API responses use snake_case keys; frontend JS converts to camelCase where needed
- Use `from_attributes=True` via Pydantic `ConfigDict` for ORM mode in response schemas
- Use `escapeHtml()` for all user-provided content rendered via innerHTML
- Store module wraps API client with team caching; use `getTeamFromCache()` for sync lookups
- FastAPI routers: one file per resource in `backend/routers/`, shared helpers for DRY
- For high-fidelity single-modal redesigns, use optional `modalClass` in `App.openModal()` and scope styles
- SQLite `create_all()` won't ALTER existing tables — must manually add columns via raw SQL
- Migration using `get_db()` generator fails in tests; use `SessionLocal()` directly in startup handlers
- Check `inspector.has_table()` before `ALTER TABLE`
- Glassmorphism effect: combine `backdrop-filter: blur()` with `rgba()` background and radial gradient glow
- When contrast issues are pervasive, fix at design token level
- For dark themes, muted text should be at least `#6b9b72` brightness on `#132218` backgrounds for WCAG AA
- Test both new format AND legacy format simultaneously to catch regressions

---

<!-- Learnings from implementation will be appended below -->

## [2026-02-26] - Phase 1 Tasks 1-4: Backend Settings API
- **Implemented:** Setting ORM model (key-value), Pydantic schemas, GET/PUT /api/settings, DELETE /api/data/reset, dynamic scoring integration
- **Files changed:** orm_models.py, schemas.py, settings.py (new), data.py, games.py, main.py, test_settings.py (new), test_stats_data.py
- **Commits:** a32d4c0, 52b33d6, e18c12d
- **Learnings:**
  - Patterns: Key-value Setting model is simpler than structured columns for flexible settings — JSON serialization in value column handles nested objects (scoring config)
  - Patterns: `_get_scoring_config()` helper centralizes scoring lookup — pass `db` session through to avoid creating new connections
  - Gotchas: Default seeding must happen after `create_tables()` — if table doesn't exist yet, seed will fail
  - Gotchas: Reset endpoint must delete child records (Game, Penalty) before parent (Session) to avoid FK constraint errors with SQLite
---

## [2026-02-26] - Phase 2 Tasks 1-4: Frontend Settings UI
- **Implemented:** 5-section glassmorphism card layout, Settings JS module, App wiring, sidebar brand sync
- **Files changed:** style.css, index.html, settings.js (new), api.js, app.js
- **Commits:** f4c28e3, 6092586
- **Learnings:**
  - Patterns: CSS-only toggle switch (checkbox + label + ::before pseudo) avoids JS for visual state — use `input:checked + .slider` selector
  - Patterns: Two-column settings grid with `7fr 5fr` split provides good visual hierarchy — profile/scoring left, utilities right
  - Patterns: Stagger card entrance animations with `animation-delay` on `:nth-child()` for cascading reveal effect
  - Gotchas: Settings event listeners must be attached inside `render()` since the form elements exist at page load but need re-binding for state
  - Context: Reduce-motion toggle uses localStorage key `tournament_tracker_reduce_motion` and adds `.reduce-motion` class to `<html>` element
---

## [2026-02-26] - Phase 3 Tasks 1-2: Integration & Polish
- **Implemented:** E2E verification, hover effects, WCAG AA contrast audit
- **Files changed:** style.css
- **Commits:** 887cbb3, 0da9d6d
- **Learnings:**
  - Patterns: Programmatic WCAG contrast checking with relative luminance formula catches issues the eye misses — bronze (#cd7f32) at 5.5:1 is borderline
  - Patterns: `border-color` + `box-shadow` hover transitions are acceptable for non-critical interactions even though not GPU-composited
  - Gotchas: Modal innerHTML elements (reset checkboxes, confirm input) won't be found by HTML ID cross-reference scripts — they're dynamic, not in index.html
---
