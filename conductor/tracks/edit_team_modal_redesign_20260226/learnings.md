# Track Learnings: edit_team_modal_redesign_20260226

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- For high-fidelity single-modal redesigns, use an optional `modalClass` in `App.openModal()` and scope styles to `.modal.<variant>` to avoid cross-modal regressions
- For live modal previews (scores/winner state), derive render state directly from current form control values instead of duplicating transient state objects
- Use `escapeHtml()` for all user-provided content rendered via innerHTML
- API responses use snake_case keys; frontend JS converts to camelCase where needed
- Store module wraps API client with team caching; use `getTeamFromCache()` for sync lookups in render loops
- When contrast issues are pervasive, fix at the design token level (CSS custom properties) rather than per-element
- BEM naming for component variants prevents style collisions with base class

---

<!-- Learnings from implementation will be appended below -->
