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
- For high-fidelity single-modal redesigns, use an optional `modalClass` in `App.openModal()` and scope styles to `.modal.<variant>` to avoid cross-modal regressions (from: session_game_result_modal_redesign_20260223, 2026-02-23)
- For live modal previews (scores/winner state), derive render state directly from current form control values instead of duplicating transient state objects (from: session_game_result_modal_redesign_20260223, 2026-02-23)
- Dashboard rendering order: showSkeletons → fetch data → animateCounters + renderQuickActions → renderLeaderboard → renderWinChart → renderRecentResults (from: ui_ux_redesign_20260223, 2026-02-23)

## CSS & Animation Patterns

- Use `void el.offsetWidth` to force reflow and re-trigger CSS animations on class toggle (from: ui_ux_redesign_20260223, 2026-02-23)
- CSS custom properties for animation timing centralize control: `--anim-counter`, `--anim-stagger`, `--anim-entrance` (from: ui_ux_redesign_20260223, 2026-02-23)
- Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach (from: ui_ux_redesign_20260223, 2026-02-23)
- Skeleton shimmer uses `background-size: 200%` with `background-position` animation (from: ui_ux_redesign_20260223, 2026-02-23)
- Podium layout uses `align-items: flex-end` on flex container with CSS variable `--podium-height` per place (from: ui_ux_redesign_20260223, 2026-02-23)
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties) (from: ui_ux_redesign_20260223, 2026-02-23)
- When contrast issues are pervasive, fix at the design token level (CSS custom properties) rather than per-element — one change cascades to 50+ elements (from: ui_contrast_color_audit_20260224, 2026-02-24)
- For dark themes, muted text should be at least `#6b9b72` brightness on backgrounds around `#132218` to hit WCAG AA 4.5:1 contrast ratio (from: ui_contrast_color_audit_20260224, 2026-02-24)
- Glassmorphism effect: combine `backdrop-filter: blur()` with `rgba()` background and radial gradient glow (from: teams_empty_state_fix_20260224, archived 2026-02-24)
- Horizontal stepper connecting lines: use `::after` pseudo-elements with `border-top: dashed` positioned absolutely (from: teams_empty_state_fix_20260224, archived 2026-02-24)
- `grid-column: 1 / -1` is the cleanest way to span an element across all CSS Grid columns (from: teams_empty_state_fix_20260224, archived 2026-02-24)

## Gotchas

- System Python is externally managed (PEP 668) — always use venv (from: backend_mvp_20260223, 2026-02-23)
- SQLite requires `check_same_thread=False` with FastAPI (from: backend_mvp_20260223, 2026-02-23)
- SQLite DateTime column rejects ISO strings — parse with `datetime.fromisoformat()` on import (from: backend_mvp_20260223, 2026-02-23)
- `ASGITransport` is async-only; use `starlette.testclient.TestClient` for sync FastAPI tests (from: backend_mvp_20260223, 2026-02-23)
- All module functions calling async Store must themselves be async — cascading change (from: backend_mvp_20260223, 2026-02-23)
- Removing a `@keyframes` rule that other components reference breaks those components silently — always grep for usages before removing (from: ui_ux_redesign_20260223, 2026-02-23)
- `display: none/block` can't be animated; use `animation` on `.active` class instead (from: ui_ux_redesign_20260223, 2026-02-23)
- Parallel worker output can diverge on CSS/JS selector naming; coordinator integration pass is required before final validation (from: session_game_result_modal_redesign_20260223, 2026-02-23)
- Use composite keys (`teamId::playerName`) when dict keys must uniquely identify players across teams; always try composite key first, fall back to plain name for backward compat (from: duplicate_player_name_bug_20260224, 2026-02-24)
- Nullish coalescing `??` is ideal for composite-key-with-fallback lookups: `dict[compositeKey] ?? dict[plainKey]` (from: duplicate_player_name_bug_20260224, 2026-02-24)
- Inline SVG `<defs>` gradient IDs must be unique per page to avoid ID collisions when multiple SVGs are present (from: teams_empty_state_fix_20260224, archived 2026-02-24)
- When replacing empty states with inline SVGs, update both JS render functions AND static HTML in index.html to keep initial render consistent (from: teams_empty_state_fix_20260224, archived 2026-02-24)
- Hardcoded color values in SVG data URIs (e.g., form-select chevron) won't update when CSS custom properties change — grep for old hex values after token changes (from: ui_contrast_color_audit_20260224, 2026-02-24)
- `::placeholder` text doesn't require 4.5:1 contrast ratio since it's non-essential content — 3:1 is acceptable per WCAG (from: ui_contrast_color_audit_20260224, 2026-02-24)

## Testing

- Use `StaticPool` + `check_same_thread=False` for SQLite in-memory test engines (from: backend_mvp_20260223, 2026-02-23)
- Override FastAPI `get_db` dependency in test fixtures with fresh in-memory engine per test (from: backend_mvp_20260223, 2026-02-23)
- Import all ORM models in `conftest.py` to ensure they're registered with `Base.metadata` (from: backend_mvp_20260223, 2026-02-23)
- Points calculation: 1st=4, 2nd=3, 3rd=2, 4th+=1; 2 players: 1st=4, 2nd=1 (from: backend_mvp_20260223, 2026-02-23)
- Test both new format AND legacy format simultaneously to catch regressions when migrating key schemas (from: duplicate_player_name_bug_20260224, archived 2026-02-24)

## Static Assets & UI Components

- FastAPI `StaticFiles` mounts must include all frontend asset directories (css, js, images) — missing mounts cause silent 404s for new assets (from: empty_state_redesign_20260224, archived 2026-02-24)
- Inline SVG illustrations are more reliable than external images for empty states (no server dependency, always theme-consistent, no broken images) (from: empty_state_redesign_20260224, archived 2026-02-24)
- BEM naming for component variants (`.empty-state-hero__title`) prevents style collisions with base `.empty-state` class (from: empty_state_redesign_20260224, archived 2026-02-24)
- `aria-hidden="true"` on decorative SVGs prevents screen readers from announcing visual-only content (from: teams_empty_state_fix_20260224, archived 2026-02-24)
- SVG `<text>` elements need explicit `font-family` attribute to render consistently across browsers (from: teams_empty_state_fix_20260224, archived 2026-02-24)

---
Last refreshed: 2026-02-24T17:41
