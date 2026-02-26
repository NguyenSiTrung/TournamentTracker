# Spec: Edit Team Modal Redesign + Team Identity System

## Overview
The Edit Team modal currently uses the old, basic form styling (`form-group`, `player-input-row`, plain buttons) while the Create Team modal was redesigned with a premium look (custom header, color picker, live preview, styled player chips with `ct-*` CSS classes, `modal-create-team` variant). This track unifies both modals to share the same premium design and introduces persistent team identity fields (color, tag) stored in the backend.

## Functional Requirements

### FR1: Edit Team Modal Visual Parity
- The Edit Team modal MUST use the same `modal-create-team` modal variant class
- MUST include the custom `ct-header` with icon and subtitle (text changed to "Edit Team" / "Update your squad details.")
- MUST use `ct-player-row` layout with numbered avatars (P1, P2, etc.) and styled remove buttons
- MUST use `ct-footer` layout with styled Cancel and Save buttons
- MUST include `ct-divider` between identity and players sections

### FR2: Color Picker in Edit Modal
- Edit modal MUST show the same `ct-color-picker` with 8 color swatches
- The team's stored color MUST be pre-selected (`.active` class) on modal open
- Color changes update the live preview in real-time

### FR3: Tag Input in Edit Modal
- Edit modal MUST include the tag input field (`ct-input-tag`, maxlength=4)
- Pre-populated with the team's stored tag value
- Character count updates in real-time

### FR4: Live Preview in Edit Modal
- Edit modal MUST include the `ct-preview-card` with avatar, name, and tag
- Preview MUST be pre-populated with current team data on open
- Preview updates in real-time as user edits name, tag, or color

### FR5: Backend — New Team Fields
- Team model MUST add `color` (string, nullable) and `tag` (string, max 4 chars, nullable) columns
- Create Team API endpoint MUST accept optional `color` and `tag` fields
- Update Team API endpoint MUST accept optional `color` and `tag` fields
- GET Team/Teams endpoints MUST return `color` and `tag` in response

### FR6: Migration — Auto-assign Defaults
- Existing teams without color/tag get auto-assigned defaults on app startup or migration
- Default color: cycle through the 8-color palette by team creation order (index-based)
- Default tag: first 2-4 uppercase characters of team name

### FR7: Team Cards — Use Stored Identity
- Team card avatar gradient MUST use the team's stored `color` instead of index-based cycling
- Team card accent stripe MUST use the stored `color`
- Team tag MUST be displayed on the team card (small badge near team name)

### FR8: Shared Code — DRY Refactor
- Extract shared modal body generation into a reusable function (e.g., `buildTeamFormBody(team?)`)
- Create modal uses it with empty defaults; Edit modal uses it with pre-populated data
- Shared functions: `addPlayerInput()`, `removePlayer()`, `updatePreview()`, etc. already work for both

## Non-Functional Requirements
- All existing `ct-*` CSS classes must be reused; no new parallel class hierarchy
- WCAG AA contrast compliance must be maintained
- `prefers-reduced-motion` must be respected
- `escapeHtml()` must be used for all user content rendered via innerHTML

## Acceptance Criteria
1. Edit Team modal is visually indistinguishable in layout/style from Create Team modal
2. Opening Edit Team pre-populates: name, tag, color (selected swatch), all players
3. Live preview updates correctly when editing any field
4. Saving from Edit modal persists color and tag to backend
5. Creating new team persists color and tag to backend
6. Team cards display the stored color and tag
7. Existing teams are auto-assigned default color and tag on migration
8. No visual regressions on Create Team modal
9. All backend tests pass with new fields

## Out of Scope
- Team logo/image upload
- Custom hex color input (only preset palette)
- Displaying color/tag in session scoreboard or leaderboard (future track)
