# Track Learnings: dashboard_analytics_visualizations_20260226

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- Dashboard rendering order: showSkeletons → fetch data → animateCounters + renderQuickActions → renderLeaderboard → renderWinChart → renderRecentResults
- CSS custom properties for animation timing centralize control: `--anim-counter`, `--anim-stagger`, `--anim-entrance`
- Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties)
- Use `void el.offsetWidth` to force reflow and re-trigger CSS animations on class toggle
- Glassmorphism effect: combine `backdrop-filter: blur()` with `rgba()` background and radial gradient glow
- For dark themes, muted text should be at least `#6b9b72` brightness on backgrounds around `#132218` to hit WCAG AA 4.5:1 contrast ratio
- Stagger card entrance animations with `animation-delay` on `:nth-child()` selectors for cascading reveal
- Store module wraps API client with team caching; use `getTeamFromCache()` for sync lookups in render loops
- FastAPI routers: one file per resource in `backend/routers/`, shared helpers for DRY
- Backend color/identity palettes must stay in sync with frontend palettes — any palette change must update both

---

<!-- Learnings from implementation will be appended below -->
