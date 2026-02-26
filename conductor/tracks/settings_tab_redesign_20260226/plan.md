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

- [ ] Task 3: Create Reset Data API endpoint
  - [ ] Add `DELETE /api/data/reset` endpoint to data router
  - [ ] Accept body: `{ "teams": bool, "sessions": bool, "settings": bool }`
  - [ ] Implement selective deletion with proper cascade handling
  - [ ] Write tests for reset endpoint

- [ ] Task 4: Integrate scoring config into game scoring logic
  - [ ] Modify scoring calculation to read from settings instead of hardcoded values
  - [ ] Update `backend/routers/games.py` or scoring utility
  - [ ] Write tests verifying custom scoring rules are applied

- [ ] Task 5: Conductor — User Manual Verification 'Backend — Settings API & Database' (Protocol in workflow.md)

## Phase 2: Frontend — Settings Tab UI Redesign
<!-- execution: parallel -->
<!-- depends: -->

- [ ] Task 1: Create Settings CSS component styles
  <!-- files: css/style.css -->
  - [ ] Add settings-specific CSS: `.settings-grid`, `.settings-card`, `.settings-card-header`, `.settings-card-icon`
  - [ ] Glassmorphism card styles with backdrop-blur and green glow borders
  - [ ] Scoring placement cards with gold/silver/bronze color coding
  - [ ] Danger zone styling (red border, red button)
  - [ ] Toggle switch component CSS
  - [ ] Data stats panel styling
  - [ ] Two-column responsive grid layout (7/5 split)

- [ ] Task 2: Rebuild Settings HTML structure in index.html
  <!-- files: index.html -->
  - [ ] Replace existing minimal settings section with 5-section card layout
  - [ ] Tournament Profile card with form inputs
  - [ ] Scoring Configuration card with placement cards and 2-player toggle
  - [ ] Data Management card with export/import, stats display, reset button
  - [ ] Appearance card with reduce motion toggle and theme indicator
  - [ ] About card with app info
  - [ ] All inputs with proper labels, IDs, and aria attributes

- [ ] Task 3: Implement Settings JavaScript module
  <!-- files: js/settings.js -->
  <!-- depends: task1, task2 -->
  - [ ] Create `js/settings.js` with Settings IIFE module
  - [ ] `Settings.render()` — fetch settings from API and populate form fields
  - [ ] `Settings.saveProfile()` — save league name, season, description
  - [ ] `Settings.saveScoring()` — save scoring configuration
  - [ ] `Settings.loadDataStats()` — fetch and display team/session/game counts
  - [ ] `Settings.showResetModal()` — open reset confirmation modal with checkboxes
  - [ ] `Settings.executeReset()` — call reset API with selected categories
  - [ ] `Settings.toggleReduceMotion()` — toggle CSS class + localStorage
  - [ ] `Settings.restoreDefaultScoring()` — reset to 4/3/2/1

- [ ] Task 4: Wire up Settings to App module
  <!-- files: js/app.js, index.html -->
  <!-- depends: task3 -->
  - [ ] Add `<script src="js/settings.js">` to index.html
  - [ ] Add `Settings.render()` call in `App.switchTab('settings')` case
  - [ ] Update sidebar brand text dynamically from settings API on init
  - [ ] Wire export/import buttons to existing handlers
  - [ ] Apply stored reduce-motion preference on page load

- [ ] Task 5: Conductor — User Manual Verification 'Frontend — Settings Tab UI Redesign' (Protocol in workflow.md)

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
