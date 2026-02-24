# Spec: Duplicate Player Name Bug in Game Result Save

## Overview

When creating a new game result, if two or more players across different teams share the same name (e.g., "aad" on team1 and "aad" on team2), clicking **Save Game Result** always fails with the toast error:

> "Please assign a unique placement for each player"

...even though every player has been assigned a valid, unique placement.

## Root Cause

The `player_placements` data structure is a **flat dictionary keyed by player name** (`dict[str, int]`). When two players share the same name across different teams:

1. **Frontend (`saveGame()` in `session.js`, line 783):** `playerPlacements[playerName] = pos` — the second player overwrites the first, so `Object.keys(playerPlacements).length` (3) < `selects.length` (4), triggering the error toast at line 787.

2. **Backend (`GameCreate` schema, `schemas.py` line 88):** `player_placements: dict[str, int]` — even if the frontend sent the data correctly, the dict would silently lose one player's placement.

3. **Live scoreboard (`computeAddGameLiveTotals()`, line 399):** The same key-collision silently corrupts team totals and winner detection during live preview.

## Steps to Reproduce

1. Create two teams with at least one shared player name (e.g., team1 has ["a", "v"], team2 has ["aad", "aad"]).
   - Or more commonly: team1 has player "aad", team2 also has a player called "aad".
2. Start a session with both teams.
3. Open the "Add Game Result" modal.
4. Assign a unique placement to every player (1st, 2nd, 3rd, 4th).
5. Click "Save Game Result".
6. **Expected:** Game result saves successfully.
7. **Actual:** Toast shows "Please assign a unique placement for each player".

## Functional Requirements

### FR-1: Use composite key for player identification
Replace `playerName` as the sole identifier with a **composite key** that includes team context, e.g., `teamId::playerName`. This disambiguates players with the same name across different teams.

**Affected layers:**
- Frontend: `saveGame()`, `computeAddGameLiveTotals()`, `showAddGameModal()` select data-attributes
- Backend: `GameCreate` schema, `add_game()` router, all consumers of `player_placements` and `player_points`
- Data import/export: `data.py` router (must handle both old flat-key format and new composite-key format for backward compatibility)

### FR-2: Backward compatibility
- Existing saved games with flat player-name keys must still render correctly.
- Data export should export the new format. Data import must accept both old and new formats.

### FR-3: Live scoreboard accuracy
- The live scoreboard in the Add Game modal must accurately reflect team totals and winner even when players share names.

### FR-4: Display uses player name only
- The UI should still display just the player name (e.g., "aad"), not the composite key (e.g., "team123::aad").

## Acceptance Criteria

- [ ] AC-1: A game result with duplicate player names across teams saves without error.
- [ ] AC-2: Points are calculated correctly for each player regardless of name collisions.
- [ ] AC-3: Live scoreboard preview shows correct team totals and winner with duplicate names.
- [ ] AC-4: Existing game data (flat-key format) still renders correctly.
- [ ] AC-5: Backend tests cover the duplicate player name scenario.
- [ ] AC-6: No regression in normal (unique name) game result flow.

## Out of Scope

- Preventing duplicate player names within the same team (that's a separate UX decision).
- Renaming existing player data in the database.
