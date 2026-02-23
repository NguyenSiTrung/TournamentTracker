# Spec: Session Add Game Result Modal Redesign

## Overview
Redesign the active-session "Add Game" modal into a card-based "Game Result" experience matching the provided visual direction: dark green glassmorphism, team cards, winner emphasis, per-player rank selectors, and integrated optional penalty entry.

## Functional Requirements

1. **Modal Visual Redesign**
- Replace the current form layout with a modern, wide modal layout similar to the reference screenshot.
- Add a stronger visual hierarchy: title row, team result card grid, penalty section, and sticky action footer.
- Keep behavior inside the existing global modal system (open/close, ESC, overlay click).

2. **Team Result Cards**
- Show one card per session team with team badge/initial, team name, and optional winner chip.
- Inside each card, render one selector per player (`P1 Rank`, `P2 Rank`, etc.) with ordinal labels and score preview.
- Compute and display each team's total game score in real time from selected placements.

3. **Live Winner Highlight**
- Determine current winner from live totals and visually highlight that team card.
- If totals tie or incomplete input, do not show winner state.

4. **Save Compatibility and Validation**
- Preserve existing `Store.addGame()` payload shape (`playerPlacements`, `teamPlayerMap`).
- Require a unique placement for every player across all teams.
- Keep error messaging via existing toast system.

5. **Inline Penalty (Optional)**
- Add optional "Apply Penalty to this Game" section in the same modal.
- When enabled, collect team, reason, and deduction value.
- On save success for game result, apply penalty via existing `Store.addPenalty()` flow.

6. **Responsive Behavior**
- Desktop: multi-column team-card grid.
- Tablet/mobile: stack cards and controls without overflow or clipped footer buttons.

## Non-Functional Requirements
- No backend schema/API changes.
- Keep zero-dependency frontend approach (vanilla JS/CSS/HTML).
- Follow existing styleguides and `escapeHtml()` usage for user-provided strings.
- Preserve current session render/update flow (`render()`, `App.refreshDashboard()`, toast feedback).

## Acceptance Criteria
- [ ] Add Game modal opens with redesigned card-based layout and dark-green visual style.
- [ ] Team cards display per-player rank selectors and live team total score.
- [ ] Winner card is highlighted only when rankings are complete and unique.
- [ ] Saving still creates the game and updates session scoreboard/history as before.
- [ ] Optional penalty section can apply a penalty in the same action flow.
- [ ] Validation rejects duplicate or missing placements with clear error toast.
- [ ] Modal remains usable at <= 768px and <= 480px breakpoints.
- [ ] No console errors introduced in the session flow.

## Out of Scope
- Persisting penalty linkage to a specific game in backend data model.
- Changing points calculation rules.
- Redesigning unrelated modals.
