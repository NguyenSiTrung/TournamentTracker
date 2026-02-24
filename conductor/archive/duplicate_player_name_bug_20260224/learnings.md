# Learnings: Duplicate Player Name Bug Fix

## [2026-02-24 00:56] - Phase 1 Task 1: Backend schema and game creation router
- **Implemented:** Updated `add_game()` in `games.py` to try composite key (`teamId::playerName`) first, then fall back to plain `playerName` for backward compat
- **Files changed:** `backend/routers/games.py`
- **Commit:** a2d47a8
- **Learnings:**
  - Patterns: Composite key pattern `teamId::playerName` works well for disambiguating players across teams while keeping the same dict[str, int] schema
  - Gotchas: The schema (`GameCreate`, `GameResponse`) didn't need changes — it's still `dict[str, int]`, just the key format changed
  - Context: `_calculate_points()` is position-based only, agnostic to key format
---

## [2026-02-24 00:56] - Phase 1 Task 2: Backend tests for duplicate player names
- **Implemented:** Added 4 test cases covering composite key game creation, correct points, team score aggregation, and legacy flat key backward compat
- **Files changed:** `backend/tests/test_games_penalties.py`
- **Commit:** c9ab203
- **Learnings:**
  - Patterns: Test both new format AND legacy format simultaneously to catch regressions
  - Context: All 48 tests pass (44 original + 4 new)
---

## [2026-02-24 00:56] - Phase 2 Task 1: Frontend saveGame() composite keys
- **Implemented:** Changed `playerPlacements[playerName]` to `playerPlacements[\`${teamId}::${playerName}\`]` — this was the root frontend cause
- **Files changed:** `js/session.js`
- **Commit:** 5cb53ee
- **Learnings:**
  - Patterns: The select elements already had both `data-team-id` and `data-player-name` attributes, so constructing the composite key was trivial
  - Gotchas: `computeAddGameLiveTotals()` already used unique `data-preview-id` (team-idx + player-idx based), so no collision there — only `saveGame()` needed the fix
  - Context: The live scoreboard was never affected because it used DOM indices, not player names as keys
---

## [2026-02-24 00:56] - Phase 3 Task 1: Rendering backward compatibility
- **Implemented:** Updated `renderMatrixTeamCell()` and `renderGameCard()` to try composite key first, fall back to plain name
- **Files changed:** `js/session.js`
- **Commit:** d7cdcc2
- **Learnings:**
  - Patterns: Nullish coalescing `??` is perfect for composite-key-with-fallback: `game.player_placements[compositeKey] ?? game.player_placements[playerName]`
  - Context: Import/export needed no changes — it stores raw JSON dicts, inherently format-agnostic
---
