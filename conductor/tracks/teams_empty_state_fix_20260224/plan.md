# Plan: Teams Empty State UI/UX Redesign + Consistency Pass

## Phase 1: CSS Foundation & Layout Fix
<!-- execution: sequential -->
<!-- depends: -->

- [ ] Task 1: Fix empty state centering in teams-grid
  - [ ] Add `.teams-grid .empty-state-hero` override to span full grid width
  - [ ] Ensure empty state hero uses `min-height` to fill available vertical space
  - [ ] Add centering rules for the empty state within its parent container

- [ ] Task 2: Add glassmorphism card container styles
  - [ ] Create `.empty-state-hero-card` wrapper class with glass backdrop
  - [ ] Add subtle border, background blur, and radial gradient glow
  - [ ] Add hover micro-interaction (subtle border glow)
  - [ ] Ensure responsive behavior at 768px and 480px breakpoints

- [ ] Task 3: Redesign steps section as horizontal progress stepper
  - [ ] Restyle `.empty-state-hero__steps` as horizontal flex row with gap
  - [ ] Add connecting dotted line between steps using `::after` pseudo-elements
  - [ ] Compact step icons and labels for ~70px total height
  - [ ] Add mobile fallback (≤480px → vertical stack, no connecting lines)

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Inline SVG Illustrations
<!-- execution: parallel -->
<!-- depends: -->

- [ ] Task 1: Create Teams trophy SVG illustration
  <!-- files: js/teams.js, index.html -->
  - [ ] Design inline SVG with trophy, team silhouettes, sparkle accents
  - [ ] Use color palette: #4caf50, #00c853, #2e7d32, #ffd700
  - [ ] Size: viewBox 0 0 180 180

- [ ] Task 2: Create Dashboard leaderboard podium SVG illustration
  <!-- files: js/app.js, index.html -->
  - [ ] Design inline SVG with podium, ranking stars, medal elements
  - [ ] Match color palette and style of Session controller SVG

- [ ] Task 3: Create History archive SVG illustration
  <!-- files: js/history.js -->
  - [ ] Design inline SVG with clock/timeline, chart elements
  - [ ] Reuse for both Stats and Sessions History sections

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Apply Redesigned Empty States
<!-- execution: sequential -->
<!-- depends: phase1, phase2 -->

- [ ] Task 1: Update Teams empty state (JS + HTML)
  - [ ] Replace PNG `<img>` with inline SVG in `js/teams.js` render function
  - [ ] Replace PNG `<img>` with inline SVG in `index.html` static Teams section
  - [ ] Wrap empty state in `.empty-state-hero-card` container
  - [ ] Verify centering and responsive behavior

- [ ] Task 2: Update Dashboard leaderboard empty state
  - [ ] Replace PNG `<img>` with inline SVG in `index.html` leaderboard section
  - [ ] Replace PNG `<img>` with inline SVG in `js/app.js` render function
  - [ ] Wrap in `.empty-state-hero-card` container

- [ ] Task 3: Update History empty states (Stats + Sessions)
  - [ ] Replace PNG `<img>` with inline SVG in `index.html` history sections
  - [ ] Replace PNG `<img>` with inline SVG in `js/history.js` render function
  - [ ] Wrap in `.empty-state-hero-card` container

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Cleanup & Polish
<!-- execution: sequential -->
<!-- depends: phase3 -->

- [ ] Task 1: Remove unused PNG assets
  - [ ] Delete `images/empty-states/teams-trophy.png`
  - [ ] Delete `images/empty-states/leaderboard-podium.png`
  - [ ] Delete `images/empty-states/history-archive.png`
  - [ ] Verify no remaining references to deleted files

- [ ] Task 2: Accessibility & animation polish
  - [ ] Verify `prefers-reduced-motion` disables float animations for new SVGs
  - [ ] Ensure all SVGs have proper `aria-hidden="true"` or `role="img"` + title
  - [ ] Test at 768px and 480px breakpoints
  - [ ] Verify no console errors

- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
