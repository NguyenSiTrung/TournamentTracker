# Plan: Redesign Empty States

## Phase 1: Design System & Assets

- [ ] Task 1: Generate illustration assets for all 5 primary empty states
  - [ ] Generate Teams empty state trophy illustration (dark green theme background, trophy with characters)
  - [ ] Generate Dashboard leaderboard illustration (podium/rankings theme)
  - [ ] Generate Dashboard sessions illustration (game controller/scorecard theme)
  - [ ] Generate Session tab illustration (live game/controller theme)
  - [ ] Generate History tab illustration (archive/statistics theme)
  - [ ] Save all as optimized WebP/PNG in `images/empty-states/` directory

- [ ] Task 2: Create CSS component for illustrated empty states
  - [ ] Define `.empty-state-hero` container with centered layout, padding, max-width
  - [ ] Define `.empty-state-hero__illustration` for image sizing and fade-in animation
  - [ ] Define `.empty-state-hero__title` for bold heading
  - [ ] Define `.empty-state-hero__subtitle` for muted descriptive text
  - [ ] Define `.empty-state-hero__cta` for full-width green CTA button
  - [ ] Define `.empty-state-hero__steps` for "How it works" horizontal step strip
  - [ ] Add `prefers-reduced-motion` support
  - [ ] Add responsive breakpoints (768px, 480px)

## Phase 2: Teams Empty State Implementation

- [ ] Task 1: Implement Teams tab illustrated empty state
  - [ ] Update `Teams.render()` in `js/teams.js` to render illustrated empty state HTML
  - [ ] Include illustration image, heading, subtitle, CTA button, and "How it works" steps
  - [ ] Wire CTA button to `Teams.showCreateModal()`
  - [ ] Update `index.html` default Teams empty state markup to match

- [ ] Task 2: Verify Teams empty state
  - [ ] Test with zero teams — verify illustrated empty state renders
  - [ ] Test CTA button opens create team modal
  - [ ] Test creating a team replaces empty state with team cards
  - [ ] Test responsive layout at 768px and 480px

## Phase 3: Dashboard & Session Empty States

- [ ] Task 1: Implement Dashboard leaderboard empty state
  - [ ] Update `App.renderLeaderboard()` in `js/app.js` to render illustrated empty state
  - [ ] Update `index.html` default leaderboard empty state markup
  - [ ] Wire CTA to switch to session tab

- [ ] Task 2: Implement Dashboard recent sessions empty state
  - [ ] Update `App.renderRecentSessions()` in `js/app.js` for illustrated empty state
  - [ ] Update `index.html` default sessions table empty state
  - [ ] Wire CTA to trigger new session flow

- [ ] Task 3: Enhance Session tab no-active-session empty state
  - [ ] Replace emoji icon with generated illustration in `index.html`
  - [ ] Apply consistent `.empty-state-hero` styling
  - [ ] Keep existing CTA + resume session functionality

## Phase 4: History Empty States & Polish

- [ ] Task 1: Implement History tab empty states
  - [ ] Update Overall Stats empty state in `js/history.js` and `index.html`
  - [ ] Update Session History empty state in `js/history.js` and `index.html`
  - [ ] Wire CTA to switch to session tab

- [ ] Task 2: Polish inline empty states
  - [ ] Update inline empty states (games list, penalties, scoreboard) with subtle icon + text style
  - [ ] Ensure consistent `.empty-state` styling across all inline instances

- [ ] Task 3: Final cross-browser and responsive testing
  - [ ] Verify all 5 primary empty states render correctly
  - [ ] Test responsive layouts at 768px and 480px breakpoints
  - [ ] Verify `prefers-reduced-motion` disables animations
  - [ ] Verify all CTA buttons trigger correct actions

- [ ] Task: Conductor - User Manual Verification 'Phase 4: History Empty States & Polish' (Protocol in workflow.md)
