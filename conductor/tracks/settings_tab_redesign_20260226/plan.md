# Plan: Settings Tab Redesign

## Phase 1: Backend — Settings API & Database
<!-- execution: sequential -->

- [x] Task 1: Create Settings ORM model and database migration
  - [x] Add `Setting` model to `backend/database/orm_models.py` (key-value store or structured table)
  - [x] Add Pydantic schemas for settings requests/responses
  - [x] Create migration logic in `main.py` startup (ALTER TABLE / create_all pattern)
  - [x] Default seed: league_name="Pro League", season="Season 4", description="", scoring={1:4, 2:3, 3:2, 4:1}, scoring_2p={1:4, 2:1}

- [x] Task 2: Create Settings API router
  - [x] Create `backend/routers/settings.py` with:
    - `GET /api/settings` — retrieve all settings
    - `PUT /api/settings` — update settings (league info + scoring rules)
  - [x] Register router in `main.py`
  - [x] Write tests for settings endpoints

- [x] Task 3: Create Reset Data API endpoint
  - [x] Add `DELETE /api/data/reset` endpoint to data router
  - [x] Accept body: `{ "teams": bool, "sessions": bool, "settings": bool }`
  - [x] Implement selective deletion with proper cascade handling
  - [x] Write tests for reset endpoint

- [x] Task 4: Integrate scoring config into game scoring logic
  - [x] Modify scoring calculation to read from settings instead of hardcoded values
  - [x] Update `backend/routers/games.py` or scoring utility
  - [x] Write tests verifying custom scoring rules are applied

- [x] Task 5: Conductor — User Manual Verification 'Backend — Settings API & Database' (Protocol in workflow.md)

## Phase 2: Frontend — Settings Tab UI Redesign
<!-- execution: parallel -->
<!-- depends: -->

- [x] Task 1: Create Settings CSS component styles
  <!-- files: css/style.css -->
  - [x] Add settings-specific CSS: `.settings-grid`, `.settings-card`, `.settings-card-header`, `.settings-card-icon`
  - [x] Glassmorphism card styles with backdrop-blur and green glow borders
  - [x] Scoring placement cards with gold/silver/bronze color coding
  - [x] Danger zone styling (red border, red button)
  - [x] Toggle switch component CSS
  - [x] Data stats panel styling
  - [x] Two-column responsive grid layout (7/5 split)

- [x] Task 2: Rebuild Settings HTML structure in index.html
  <!-- files: index.html -->
  - [x] Replace existing minimal settings section with 5-section card layout
  - [x] Tournament Profile card with form inputs
  - [x] Scoring Configuration card with placement cards and 2-player toggle
  - [x] Data Management card with export/import, stats display, reset button
  - [x] Appearance card with reduce motion toggle and theme indicator
  - [x] About card with app info
  - [x] All inputs with proper labels, IDs, and aria attributes

- [x] Task 3: Implement Settings JavaScript module
  <!-- files: js/settings.js -->
  <!-- depends: task1, task2 -->
  - [x] Create `js/settings.js` with Settings IIFE module
  - [x] `Settings.render()` — fetch settings from API and populate form fields
  - [x] `Settings.saveProfile()` — save league name, season, description
  - [x] `Settings.saveScoring()` — save scoring configuration
  - [x] `Settings.loadDataStats()` — fetch and display team/session/game counts
  - [x] `Settings.showResetModal()` — open reset confirmation modal with checkboxes
  - [x] `Settings.executeReset()` — call reset API with selected categories
  - [x] `Settings.toggleReduceMotion()` — toggle CSS class + localStorage
  - [x] `Settings.restoreDefaultScoring()` — reset to 4/3/2/1

- [x] Task 4: Wire up Settings to App module
  <!-- files: js/app.js, index.html -->
  <!-- depends: task3 -->
  - [x] Add `<script src="js/settings.js">` to index.html
  - [x] Add `Settings.render()` call in `App.switchTab('settings')` case
  - [x] Update sidebar brand text dynamically from settings API on init
  - [x] Wire export/import buttons to existing handlers
  - [x] Apply stored reduce-motion preference on page load

- [x] Task 5: Conductor — User Manual Verification 'Frontend — Settings Tab UI Redesign' (Protocol in workflow.md)

## Phase 3: Integration & Polish
<!-- execution: sequential -->
<!-- depends: phase1, phase2 -->

- [ ] Task 1: End-to-end testing and bug fixes
  - [ ] Test full flow: edit profile → save → verify sidebar updates
  - [ ] Test scoring config: change points → add game → verify new scoring applied
  - [ ] Test reset: selective reset with confirmation → verify data cleared
  - [ ] Test reduce motion toggle persistence
  - [ ] Test responsive layout at 768px and 480px breakpoints

- [ ] Task 2: Visual polish and animation
  - [ ] Add entrance animations (fadeSlideUp) to settings cards
  - [ ] Add hover effects on interactive cards
  - [ ] Verify WCAG AA contrast on all new elements
  - [ ] Ensure prefers-reduced-motion blanket covers new animations

- [ ] Task 3: Conductor — User Manual Verification 'Integration & Polish' (Protocol in workflow.md)
