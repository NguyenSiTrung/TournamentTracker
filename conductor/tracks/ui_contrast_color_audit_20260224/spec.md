# Spec: UI/UX Contrast & Color Audit

## Overview
Comprehensive review and improvement of contrast, color consistency, accessibility, and visual hierarchy across all sections of the Tournament Tracker UI. Issues will be identified and fixed in-place during each phase.

## Scope
All UI areas: Dashboard (stat cards, leaderboard, win chart, empty states), Session tab (active session dashboard, game result modal, scoreboard), Teams tab (team list, player cards), History tab (session history, stats table), Global elements (sidebar navigation, modals, buttons, badges, toasts, forms).

## Functional Requirements

### FR-1: Text Readability
- Ensure all body text, labels, and headings have sufficient contrast against their backgrounds
- Review `--text-muted` (#4a7c50) and `--text-dim` (#2e5233) usage — these may be too dark on the `--bg-card` (#132218) and `--bg-body` (#0b1a0f) backgrounds
- Ensure stat card labels, table headers, and secondary text are legible

### FR-2: WCAG AA Contrast Compliance
- All normal text must achieve ≥ 4.5:1 contrast ratio against its background
- All large text (≥18px or ≥14px bold) must achieve ≥ 3:1 contrast ratio
- Interactive UI elements (buttons, links, form controls) must achieve ≥ 3:1 against adjacent colors
- Border/divider visibility should be sufficient to convey structure

### FR-3: Color Consistency
- Audit CSS custom properties for redundant or inconsistent color values
- Ensure the green palette is harmonious and not over-saturated
- Status colors (finalized, review, pending) should be clearly distinguishable from each other

### FR-4: Dark Theme Refinement
- Glassmorphism/transparency overlays must not reduce readability
- Card backgrounds should have enough separation from body/main backgrounds
- Modal overlays and backdrop should maintain content legibility

### FR-5: Visual Hierarchy
- Primary actions (buttons) should clearly stand out from secondary/ghost buttons
- Active navigation items should be visually distinct from inactive ones
- Leaderboard rankings (gold/silver/bronze) should have strong visual differentiation
- Empty states should be visible but not distracting

## Non-Functional Requirements
- Changes must be CSS-only (no structural HTML or JS changes unless absolutely necessary)
- Must preserve the existing dark green theme identity
- Must pass `prefers-reduced-motion` accessibility support (already in place)
- No regressions to existing animations or transitions

## Acceptance Criteria
1. All text elements pass WCAG AA contrast ratio (4.5:1 normal, 3:1 large)
2. No text is "invisible" or hard to read on any background
3. Color palette is consistent and harmonious across all sections
4. Visual hierarchy is clear — users can immediately identify primary vs secondary content
5. Dark theme feels polished and premium without sacrificing readability
6. Manual visual inspection confirms improvements in every section

## Out of Scope
- Light theme / theme switcher
- Color scheme redesign (keeping dark green identity)
- New component design or layout changes
- Backend or JavaScript logic changes
