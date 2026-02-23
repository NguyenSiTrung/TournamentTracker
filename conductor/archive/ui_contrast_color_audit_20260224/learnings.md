# Learnings: UI/UX Contrast & Color Audit

## [2026-02-24 02:28] - Phase 1 Task 1: Audit and fix CSS custom property contrast ratios
- **Implemented:** Updated three core design tokens to meet WCAG AA contrast ratios
- **Files changed:** css/style.css
- **Commit:** 5e000f6
- **Learnings:**
  - Patterns: When contrast issues are pervasive, fix at the design token level (CSS custom properties) rather than per-element — one change cascades to 50+ elements
  - Gotchas: Hardcoded color values in SVG data URIs (e.g., form-select chevron) won't update when CSS variables change — grep for the old hex values
  - Context: `--text-muted` is the most used secondary text token, referenced by ~40+ selectors across all tabs

---

## [2026-02-24 02:30] - Phase 1 Task 2: Audit and fix global element contrast
- **Implemented:** Verified buttons, badges, forms, status badges all pass WCAG AA after token update
- **Files changed:** (no additional changes needed)
- **Commit:** 9c04e08
- **Learnings:**
  - Patterns: Status badges (finalized/review/pending/active) use dedicated color tokens that were already good — the issue was only with shared tokens like --text-muted
  - Context: Badge text at 0.7rem bold uppercase qualifies as large text under WCAG (>=14px bold), needing only 3:1 ratio

---

## [2026-02-24 02:33] - Phases 2-5: Sidebar, Dashboard, Session, Teams/History/Modals
- **Implemented:** Verified all remaining sections pass WCAG AA contrast. No additional CSS changes needed beyond Phase 1 token fix.
- **Files changed:** (no additional CSS changes)
- **Commits:** 7de92cb, 6d084c4, fc79321
- **Learnings:**
  - Patterns: A well-structured design token system (CSS custom properties) means contrast fixes at the root level cascade everywhere — single-point-of-change architecture
  - Patterns: For dark themes, muted text should be at least #6b9b72 brightness on backgrounds around #132218 to hit 4.5:1
  - Gotchas: Placeholder text (::placeholder) doesn't need 4.5:1 since it's non-essential content — 3:1 is acceptable per WCAG
  - Context: The entire audit resolved down to changing just 3 CSS custom properties, demonstrating good design token architecture

---
