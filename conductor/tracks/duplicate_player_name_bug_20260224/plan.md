# Implementation Plan

## Phase 1: Backend Fix — Composite Key Support
<!-- execution: sequential -->

- [ ] Task 1: Update backend schema and game creation router
  - Change `player_placements` and `player_points` to use composite keys (`teamId::playerName`) internally
  - Update `_calculate_points` consumer logic in `add_game()` to parse composite keys
  - Update team placement/points aggregation to handle composite keys
  - Ensure `GameResponse` returns data in composite-key format

- [ ] Task 2: Write backend tests for duplicate player names
  - Add test case: two teams with a shared player name, verify game creation succeeds
  - Add test case: verify correct points calculation with duplicate names
  - Add test case: verify team placements and scores are accurate
  - Run all existing tests to confirm no regression

- [ ] Task 3: Conductor — Phase Verification

## Phase 2: Frontend Fix — saveGame and Live Scoreboard
<!-- execution: sequential -->

- [ ] Task 1: Update `saveGame()` to use composite keys
  - Change `playerPlacements[playerName]` to `playerPlacements[teamId::playerName]`
  - Update `teamPlayerMap` to use composite keys where needed
  - Update validation logic to count by composite key

- [ ] Task 2: Update `computeAddGameLiveTotals()` and related live scoreboard functions
  - Use composite key (`data-team-id::data-player-name`) for tracking used placements
  - Ensure `playerPreviewPoints` uses composite keys or preview IDs correctly
  - Verify winner detection works with duplicate names

- [ ] Task 3: Update `showAddGameModal()` select elements
  - Add `data-player-name` with the raw player name (for display)
  - Ensure select data-attributes provide both team ID and player name for composite key construction

- [ ] Task 4: Conductor — Phase Verification

## Phase 3: Backward Compatibility and Rendering
<!-- execution: sequential -->

- [ ] Task 1: Update rendering functions for backward compatibility
  - `renderMatrixTeamCell()`: handle both composite-key and flat-key `player_placements`
  - `renderGameCard()`: handle both formats for player placement display
  - Add helper to extract player name from composite key (`teamId::playerName` → `playerName`)

- [ ] Task 2: Update data import/export for both formats
  - Export: use composite-key format
  - Import: accept both old flat-key and new composite-key formats
  - Add backend import test for legacy format data

- [ ] Task 3: End-to-end manual verification
  - Test with duplicate player names across teams
  - Test with unique player names (no regression)
  - Test loading existing game data saved in old format
  - Verify live scoreboard accuracy

- [ ] Task 4: Conductor — Phase Verification
