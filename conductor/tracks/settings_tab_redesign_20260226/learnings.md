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
