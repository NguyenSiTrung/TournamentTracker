# Plan: Edit Team Modal Redesign + Team Identity System

## Phase 1: Backend — Team Identity Fields

- [x] Task 1: Add `color` and `tag` columns to Team ORM model
  - Add `color: Mapped[str | None]` and `tag: Mapped[str | None]` to `Team` class in `backend/database/orm_models.py`
  - `color` is String, nullable, default=None
  - `tag` is String(4), nullable, default=None

- [x] Task 2: Update Pydantic schemas for color/tag
  - Add `color: str | None = None` and `tag: str | None = None` to `TeamCreate`, `TeamUpdate`, and `TeamResponse` in `backend/models/schemas.py`

- [x] Task 3: Update team router to persist color/tag
  - In `create_team()`: pass `body.color` and `body.tag` to Team constructor
  - In `update_team()`: set `team.color` and `team.tag` from body

- [x] Task 4: Add migration logic for existing teams
  - On app startup, auto-assign defaults for teams with null color/tag
  - Color: cycle through 8-color palette by creation order
  - Tag: first 2-4 uppercase chars of team name
  - Add startup event in `main.py` or a migration helper

- [x] Task 5: Update backend tests
  - Test create team with color/tag
  - Test update team with color/tag
  - Test default assignment for existing teams
  - Test response includes color/tag fields

- [x] Task: Conductor - User Manual Verification 'Backend — Team Identity Fields' (Protocol in workflow.md)

## Phase 2: Frontend — API & Store Layer

- [x] Task 1: Update API client to send color/tag
  - Modify `API.createTeam()` to accept and send `color` and `tag` parameters
  - Modify `API.updateTeam()` to accept and send `color` and `tag` parameters

- [x] Task 2: Update Store layer to pass color/tag
  - Modify `Store.createTeam()` to accept and forward `color` and `tag`
  - Modify `Store.updateTeam()` to accept and forward `color` and `tag`

- [x] Task: Conductor - User Manual Verification 'Frontend — API & Store Layer' (Protocol in workflow.md)

## Phase 3: Frontend — Edit Team Modal Redesign

- [x] Task 1: Extract shared `buildTeamFormBody()` function
  - Create a reusable function that generates the modal body HTML
  - Accepts optional `team` parameter for pre-population
  - Uses all `ct-*` classes: `ct-input-row`, `ct-input-group`, `ct-color-picker`, `ct-preview-card`, `ct-player-row`, etc.
  - When `team` is provided: pre-populates name, tag, color (active swatch), players

- [x] Task 2: Extract shared `buildTeamFormFooter()` function
  - Reusable footer with `ct-footer` layout
  - Accepts mode parameter ('create' vs 'edit') for button text

- [x] Task 3: Refactor `showCreateModal()` to use shared builders
  - Replace inline HTML with calls to `buildTeamFormBody()` and `buildTeamFormFooter('create')`
  - Verify no visual regression

- [x] Task 4: Rewrite `editTeam()` to use shared builders
  - Call `buildTeamFormBody(team)` with existing team data
  - Call `buildTeamFormFooter('edit')`
  - Open modal with `modalClass: 'modal-create-team'`
  - Add custom header via setTimeout (same as Create modal, text: "Edit Team" / "Update your squad details.")
  - Pre-select the team's stored color swatch
  - Pre-populate live preview with team data

- [x] Task 5: Update `saveEditTeam()` to include color/tag
  - Read selected color and tag input values
  - Pass them through `Store.updateTeam(id, name, players, color, tag)`

- [x] Task 6: Update `saveNewTeam()` to include color/tag
  - Read selected color and tag input values
  - Pass them through `Store.createTeam(name, players, color, tag)`

- [x] Task: Conductor - User Manual Verification 'Frontend — Edit Team Modal Redesign' (Protocol in workflow.md)

## Phase 4: Team Cards — Stored Identity Display

- [x] Task 1: Update team card rendering to use stored color
  - Replace `TEAM_ACCENT_COLORS[idx % length]` with color derived from `team.color`
  - Build accent gradient from stored color value
  - Avatar uses stored color for background

- [x] Task 2: Add tag display to team cards
  - Show tag badge near team name on the card
  - Style the tag badge to match the team's accent color

- [x] Task 3: Visual polish and regression check
  - Verify team cards look correct with stored colors
  - Verify teams without color/tag (edge case) fall back gracefully
  - Test responsive layout at 768px and 480px breakpoints
  - Verify `prefers-reduced-motion` is respected

- [x] Task: Conductor - User Manual Verification 'Team Cards — Stored Identity Display' (Protocol in workflow.md)
