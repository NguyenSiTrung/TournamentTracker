# Spec: UI/UX Improvement & Dashboard Redesign

## Overview
Comprehensive UI/UX refactor to elevate Tournament Tracker's visual quality and user experience.
The Dashboard screen gets a structural redesign with a reimagined layout, while all screens
receive micro-animation polish, enriched color depth, and improved interactive feedback.

## Functional Requirements

### Dashboard Redesign (Primary Focus)
1. **Stat Cards Enhancement** — Animated number counters on load, trend indicators (↑↓ vs last session),
   subtle sparkline-style CSS bars showing recent activity
2. **Leaderboard Podium** — Top 3 teams displayed as a visual podium (1st elevated center, 2nd/3rd flanking),
   with trophy icons, gradient backgrounds per rank, and remaining teams in a compact list below
3. **Quick Action Buttons** — Prominent "Start Session" and "Create Team" shortcut buttons on Dashboard,
   contextual (e.g., hide "Create Team" if teams exist, show "Resume Session" if one is active)
4. **Data Visualizations** — CSS-based horizontal bar charts for win distribution across teams,
   points-per-session mini bars in leaderboard entries
5. **Recent Results Enrichment** — Team avatar initials, winner highlight badge, game count pill,
   slide-in staggered animation on load
6. **Empty States** — Illustrated guidance for each empty section (no teams → "Create your first team!",
   no sessions → "Start a game night!") with contextual action buttons

### Overall UI/UX Polish (All Screens)
7. **Micro-animations** — Skeleton loading placeholders during API fetches, smooth fade/slide transitions
   between tabs, staggered card entrance animations, hover micro-interactions
8. **Color & Visual Depth** — Section-specific accent colors (Teams=green, Session=blue, History=purple,
   Dashboard=gradient), richer glassmorphism layering with varied card depths
9. **Navigation Badges** — Pulsing dot indicator on Session tab when a session is active,
   count badge on History tab showing completed session count

## Non-Functional Requirements
- Pure CSS animations (no external animation libraries) — maintain zero-dependency frontend
- All animations respect `prefers-reduced-motion` media query
- Maintain existing responsive breakpoints (768px, 480px)
- No changes to backend API or data model
- Performance: animations use `transform`/`opacity` only (GPU-composited properties)

## Acceptance Criteria
- [ ] Dashboard loads with animated number counters that count up from 0
- [ ] Top 3 leaderboard teams render as a visual podium with rank-specific styling
- [ ] Quick action buttons appear on Dashboard and navigate to correct tabs
- [ ] At least one CSS bar chart visualization displays team win distribution
- [ ] Recent results show team avatars and staggered entrance animation
- [ ] Empty states show guiding text with action buttons instead of plain text
- [ ] Tab switching has smooth fade transition (not instant swap)
- [ ] Skeleton loading placeholders appear during data fetches
- [ ] Active session shows pulsing indicator on Session tab
- [ ] All animations are disabled when `prefers-reduced-motion` is set
- [ ] No regressions in existing functionality (teams CRUD, session flow, history)

## Out of Scope
- Celebration effects (confetti/particles) — future enhancement
- Mobile bottom navigation redesign — current responsive approach is adequate
- Dark/light theme toggle
- Backend API changes
- New features or data model changes
