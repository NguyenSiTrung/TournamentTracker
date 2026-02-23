# Plan: Session Add Game Result Modal Redesign

## Phase 1: Redesign Modal UX + Behavior
<!-- execution: parallel -->

- [x] Task 1: Rebuild Add Game modal structure and live scoring logic
  - Redesign modal body as team result cards with per-player rank controls
  - Add live total score and winner-highlight recalculation
  - Preserve `Store.addGame()` payload compatibility and unique-rank validation
  <!-- files: js/session.js, js/app.js -->

- [x] Task 2: Implement modal-specific visual style
  - Add glassmorphism container treatment and modern card styles
  - Style team badges, winner chips, rank controls, totals, and action footer
  - Add responsive rules for tablet/mobile collapse
  <!-- files: css/style.css -->

- [x] Task 3: Add inline penalty workflow and integration checks
  - Add optional penalty section in modal UI with toggle and inputs
  - Apply penalty via `Store.addPenalty()` after successful game save
  - Validate end-to-end behavior (save game + optional penalty + rerender)
  <!-- files: js/session.js -->
  <!-- depends: task1 -->
  <!-- depends: task2 -->

- [x] Task: Conductor - User Manual Verification 'Session Add Game Result Modal Redesign' (Protocol in workflow.md)
