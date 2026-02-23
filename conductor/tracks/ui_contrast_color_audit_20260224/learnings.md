# Track Learnings: ui_contrast_color_audit_20260224

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- CSS custom properties for animation timing centralize control: `--anim-counter`, `--anim-stagger`, `--anim-entrance` (from: ui_ux_redesign_20260223)
- Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach (from: ui_ux_redesign_20260223)
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties) (from: ui_ux_redesign_20260223)
- Removing a `@keyframes` rule that other components reference breaks those components silently — always grep for usages before removing (from: ui_ux_redesign_20260223)
- `display: none/block` can't be animated; use `animation` on `.active` class instead (from: ui_ux_redesign_20260223)
- Use `void el.offsetWidth` to force reflow and re-trigger CSS animations on class toggle (from: ui_ux_redesign_20260223)

---

<!-- Learnings from implementation will be appended below -->
