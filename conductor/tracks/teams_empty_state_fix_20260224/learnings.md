# Track Learnings: teams_empty_state_fix_20260224

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- Inline SVG illustrations are more reliable than external images for empty states (no server dependency, always theme-consistent, no broken images) (from: empty_state_redesign_20260224)
- BEM naming for component variants (`.empty-state-hero__title`) prevents style collisions with base `.empty-state` class (from: empty_state_redesign_20260224)
- FastAPI `StaticFiles` mounts must include all frontend asset directories — missing mounts cause silent 404s for new assets (from: empty_state_redesign_20260224)
- Use `void el.offsetWidth` to force reflow and re-trigger CSS animations on class toggle (from: ui_ux_redesign_20260223)
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties) (from: ui_ux_redesign_20260223)
- Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach (from: ui_ux_redesign_20260223)

---

<!-- Learnings from implementation will be appended below -->
