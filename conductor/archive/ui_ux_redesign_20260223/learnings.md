# Track Learnings: ui_ux_redesign_20260223

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- API responses use snake_case keys; frontend JS converts to camelCase where needed
- Use `escapeHtml()` for all user-provided content rendered via innerHTML
- Store module wraps API client with team caching; use `getTeamFromCache()` for sync lookups in render loops
- All module functions calling async Store must themselves be async — cascading change
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties)

---

<!-- Learnings from implementation will be appended below -->

## [2026-02-23] - Phase 1-4: Full UI/UX Redesign Implementation
Thread: T-019c8aab-e51b-76da-a95d-b7ceeae74453
- **Implemented:** Complete UI/UX overhaul: CSS design system, dashboard podium, bar charts, quick actions, skeleton loading, tab animations, nav badges, section accents
- **Files changed:** css/style.css, js/app.js, index.html
- **Learnings:**
  - Patterns: Use `void el.offsetWidth` to force reflow and re-trigger CSS animations on class toggle
  - Patterns: CSS custom properties for animation timing centralize control; `--anim-counter`, `--anim-stagger`, `--anim-entrance`
  - Patterns: Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach
  - Patterns: Skeleton shimmer uses `background-size: 200%` with `background-position` animation
  - Patterns: Podium layout uses `align-items: flex-end` on flex container with CSS variable `--podium-height` per place
  - Gotchas: Removing a `@keyframes` rule that other components reference breaks those components silently — always grep for usages
  - Gotchas: `display: none/block` can't be animated; use `animation` on `.active` class instead
  - Context: Dashboard rendering order: showSkeletons → fetch data → animateCounters + renderQuickActions → renderLeaderboard → renderWinChart → renderRecentResults
---
