# Track Learnings: empty_state_redesign_20260224

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- Use `escapeHtml()` for all user-provided content rendered via innerHTML
- CSS custom properties for animation timing centralize control: `--anim-counter`, `--anim-stagger`, `--anim-entrance`
- Global `prefers-reduced-motion` blanket (0.01ms duration on all) is simplest accessibility approach
- Performance: animations should use `transform`/`opacity` only (GPU-composited properties)
- `display: none/block` can't be animated; use `animation` on `.active` class instead
- Removing a `@keyframes` rule that other components reference breaks those components silently — always grep for usages before removing
- Dashboard rendering order: showSkeletons → fetch data → animateCounters + renderQuickActions → renderLeaderboard → renderWinChart → renderRecentResults

---

<!-- Learnings from implementation will be appended below -->
