# Spec: Teams Empty State UI/UX Redesign + Consistency Pass

## Overview
Fix the broken Teams empty state layout and redesign all empty states across the
application for visual consistency, better space utilization, and premium aesthetics.

## Functional Requirements

### FR-1: Fix Empty State Layout (All Views)
- Empty state hero must be **horizontally and vertically centered** within its
  container, filling the available content area
- The `teams-grid` CSS Grid must allow the empty state to span the full width
  (not constrained to a single grid column)
- All empty states must be wrapped in a **glassmorphism card container** with
  subtle border and backdrop blur for visual grounding

### FR-2: Replace PNG Illustrations with Inline SVGs
- **Teams:** Trophy with team silhouettes, green gradients, gold sparkle accents
- **Dashboard Leaderboard:** Podium with ranking stars and medal elements
- **History (Stats + Sessions):** Clock/timeline with chart elements
- **Session:** Already uses inline SVG — no change needed
- All SVGs must use the existing color palette: `#4caf50`, `#00c853`, `#2e7d32`,
  `#ffd700` for sparkles

### FR-3: Teams Steps → Horizontal Progress Stepper
- Convert the vertical 3-step list into a horizontal row with:
  - Numbered circle icons with themed emoji
  - Connecting dotted lines/dots between steps
  - Compact layout (~70px tall max)
- Steps must wrap gracefully on mobile (≤480px → vertical stack)

### FR-4: Consistent Empty State Structure
All empty states must follow this structure:
1. Inline SVG illustration (180×180, with float animation)
2. Title (h3, display font, 800 weight)
3. Subtitle (muted text, max-width 380px)
4. Primary CTA button (green gradient)
5. Optional: Steps stepper (Teams only)

## Non-Functional Requirements
- `prefers-reduced-motion` must disable float animations
- Responsive breakpoints: 768px and 480px
- No external image dependencies (all inline SVG)
- GPU-composited animations only (transform/opacity)

## Acceptance Criteria
- [ ] Teams empty state is centered in the full content area on desktop
- [ ] All PNG illustrations replaced with inline SVGs
- [ ] Steps section displays as horizontal stepper on desktop
- [ ] Steps wrap to vertical on mobile (≤480px)
- [ ] All 4 views (Teams, Dashboard Leaderboard, History Stats, History Sessions)
      have consistent empty state styling
- [ ] Session empty state SVG is untouched
- [ ] No dead/unused PNG image files remain
- [ ] All animations respect prefers-reduced-motion
- [ ] No console errors or visual regressions

## Out of Scope
- Session empty state redesign (already uses inline SVG)
- Adding new functionality to empty states
- Backend changes
