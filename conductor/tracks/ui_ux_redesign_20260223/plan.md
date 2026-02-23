# Plan: UI/UX Improvement & Dashboard Redesign

## Phase 1: CSS Design System Expansion
<!-- execution: sequential -->

- [x] Task 1: Expand CSS custom properties
  - Add section-specific accent colors (--accent-teams, --accent-session, --accent-history, --accent-dashboard)
  - Add animation timing variables (--anim-counter, --anim-stagger, --anim-entrance)
  - Add skeleton loading color variables
  <!-- files: css/style.css -->

- [x] Task 2: Add keyframe animation definitions
  - Counter count-up animation
  - Staggered fade-slide entrance for cards
  - Skeleton shimmer/pulse animation
  - Smooth tab crossfade transition
  - Podium reveal animation
  <!-- files: css/style.css -->

- [x] Task 3: Add prefers-reduced-motion support
  - Wrap all new animations in motion-safe media query
  - Provide instant-display fallbacks for reduced-motion users
  <!-- files: css/style.css -->

- [x] Task: Conductor - User Manual Verification 'CSS Design System Expansion' (Protocol in workflow.md)

## Phase 2: Dashboard Structural Redesign
<!-- execution: sequential -->
<!-- depends: phase1 -->

- [x] Task 1: Restructure Dashboard HTML layout
  - Reorganize section order: Quick Actions → Stat Cards → Podium Leaderboard → Data Viz → Recent Results
  - Add new container divs for podium, quick actions, and chart sections
  - Update responsive grid classes
  <!-- files: index.html -->

- [x] Task 2: Implement animated stat cards
  - JS counter animation (count from 0 to value on load)
  - Add trend indicator arrows (↑↓) comparing to previous session
  - Add mini activity bar beneath each stat value
  - CSS styling for enhanced stat cards
  <!-- files: js/app.js, css/style.css -->

- [x] Task 3: Implement leaderboard podium
  - Top 3 teams as visual podium (1st elevated center, 2nd left, 3rd right)
  - Rank-specific gradient backgrounds (gold/silver/bronze)
  - Trophy icons and team avatar initials
  - Remaining teams (4th+) in compact list below podium
  - Podium reveal animation on load
  <!-- files: js/app.js, css/style.css -->

- [x] Task 4: Implement quick action buttons
  - "Start Session" and "Create Team" prominent buttons on Dashboard
  - Contextual visibility (hide "Create Team" if enough teams exist, show "Resume Session" if active)
  - Styled as gradient accent cards with icons
  <!-- files: js/app.js, css/style.css, index.html -->

- [x] Task 5: Implement CSS bar chart visualization
  - Horizontal bar chart showing team win distribution
  - Animated bar fill on load (CSS transition width from 0 to target)
  - Color-coded bars per team rank
  - Fallback to empty state if no completed sessions
  <!-- files: js/app.js, css/style.css -->

- [x] Task 6: Enhance recent results cards
  - Add team avatar initials circle
  - Winner highlight badge with gold accent
  - Game count pill badge
  - Staggered slide-in entrance animation (each card delayed)
  <!-- files: js/app.js, css/style.css -->

- [x] Task 7: Implement illustrated empty states
  - Dashboard: guided onboarding flow ("Create teams → Start session → Play!")
  - Each empty section gets contextual icon, message, and action button
  - Subtle animation on empty state icons
  <!-- files: js/app.js, css/style.css, index.html -->

- [x] Task: Conductor - User Manual Verification 'Dashboard Structural Redesign' (Protocol in workflow.md)

## Phase 3: Overall UI Polish
<!-- execution: sequential -->
<!-- depends: phase2 -->

- [x] Task 1: Add smooth tab transition animations
  - Crossfade between tab content (opacity + translateY)
  - Tab indicator slide animation on nav bar
  - Remove instant show/hide, replace with animated swap
  <!-- files: js/app.js, css/style.css -->

- [x] Task 2: Implement skeleton loading placeholders
  - Skeleton shimmer cards for Dashboard stat cards during fetch
  - Skeleton rows for leaderboard and recent results
  - Show skeleton → fade to real content pattern
  <!-- files: js/app.js, css/style.css -->

- [x] Task 3: Add navigation badges
  - Pulsing green dot on Session tab when a session is active
  - Count badge on History tab for completed sessions
  - Update badges on data changes (session create/complete)
  <!-- files: js/app.js, css/style.css, index.html -->

- [x] Task 4: Apply section-specific color accents
  - Teams tab: green accent tint on cards and headers
  - Session tab: blue accent tint
  - History tab: purple accent tint
  - Dashboard: gradient multi-color
  - Update hover states and borders per section
  <!-- files: css/style.css -->

- [x] Task: Conductor - User Manual Verification 'Overall UI Polish' (Protocol in workflow.md)

## Phase 4: Final Testing & Verification
<!-- execution: sequential -->
<!-- depends: phase3 -->

- [x] Task 1: Cross-screen regression testing
  - Verify all existing functionality works (teams CRUD, session flow, history)
  - Test responsive layouts at 768px and 480px breakpoints
  - Verify prefers-reduced-motion disables all animations
  - Check no console errors or warnings
  <!-- files: index.html, css/style.css, js/app.js -->

- [x] Task: Conductor - User Manual Verification 'Final Testing & Verification' (Protocol in workflow.md)
