# Plan: Redesign Empty States

## Phase 1: Design System & Assets

- [x] Task 1: Generate illustration assets for all 5 primary empty states
  - [x] Generate Teams empty state trophy illustration (dark green theme background, trophy with characters)
  - [x] Generate Dashboard leaderboard illustration (podium/rankings theme)
  - [x] Generate Dashboard sessions illustration (inline SVG scorecard theme)
  - [x] Generate Session tab illustration (inline SVG game controller theme)
  - [x] Generate History tab illustration (archive/statistics theme)
  - [x] Save all as optimized WebP/PNG in `images/empty-states/` directory
  - Commit: 84aeb66

- [x] Task 2: Create CSS component for illustrated empty states
  - [x] Define `.empty-state-hero` container with centered layout, padding, max-width
  - [x] Define `.empty-state-hero__illustration` for image sizing and fade-in animation
  - [x] Define `.empty-state-hero__title` for bold heading
  - [x] Define `.empty-state-hero__subtitle` for muted descriptive text
  - [x] Define `.empty-state-hero__cta` for full-width green CTA button
  - [x] Define `.empty-state-hero__steps` for "How it works" horizontal step strip
  - [x] Add `prefers-reduced-motion` support
  - [x] Add responsive breakpoints (768px, 480px)
  - Commit: 84aeb66

## Phase 2: Teams Empty State Implementation

- [x] Task 1: Implement Teams tab illustrated empty state
  - [x] Update `Teams.render()` in `js/teams.js` to render illustrated empty state HTML
  - [x] Include illustration image, heading, subtitle, CTA button, and "How it works" steps
  - [x] Wire CTA button to `Teams.showCreateModal()`
  - [x] Update `index.html` default Teams empty state markup to match
  - Commit: 84aeb66

- [x] Task 2: Verify Teams empty state
  - [x] Test with zero teams — verify illustrated empty state renders
  - [x] Test CTA button opens create team modal
  - [x] Test creating a team replaces empty state with team cards
  - [x] Test responsive layout at 768px and 480px
  - Verified via browser screenshots

## Phase 3: Dashboard & Session Empty States

- [x] Task 1: Implement Dashboard leaderboard empty state
  - [x] Update `App.renderLeaderboard()` in `js/app.js` to render illustrated empty state
  - [x] Update `index.html` default leaderboard empty state markup
  - [x] Wire CTA to switch to session tab
  - Commit: 84aeb66

- [x] Task 2: Implement Dashboard recent sessions empty state
  - [x] Update `App.renderRecentSessions()` in `js/app.js` for illustrated empty state
  - [x] Update `index.html` default sessions table empty state
  - [x] Wire CTA to trigger new session flow
  - Commit: 84aeb66

- [x] Task 3: Enhance Session tab no-active-session empty state
  - [x] Replace emoji icon with generated illustration in `index.html`
  - [x] Apply consistent `.empty-state-hero` styling
  - [x] Keep existing CTA + resume session functionality
  - Commit: 84aeb66

## Phase 4: History Empty States & Polish

- [x] Task 1: Implement History tab empty states
  - [x] Update Overall Stats empty state in `js/history.js` and `index.html`
  - [x] Update Session History empty state in `js/history.js` and `index.html`
  - [x] Wire CTA to switch to session tab
  - Commit: 84aeb66

- [x] Task 2: Polish inline empty states
  - [x] Update inline empty states (games list, penalties, scoreboard) with subtle icon + text style
  - [x] Ensure consistent `.empty-state` styling across all inline instances
  - Commit: 89f2e08

- [x] Task 3: Final cross-browser and responsive testing
  - [x] Verify all 5 primary empty states render correctly
  - [x] Test responsive layouts at 768px and 480px breakpoints
  - [x] Verify `prefers-reduced-motion` disables animations
  - [x] Verify all CTA buttons trigger correct actions
  - Verified via browser screenshots at 480px, 768px, and 1200px

- [ ] Task: Conductor - User Manual Verification 'Phase 4: History Empty States & Polish' (Protocol in workflow.md)
