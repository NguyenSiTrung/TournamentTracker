# Plan: Backend API & Frontend Integration MVP

## Phase 1: Backend Project Setup
- [x] Task: Initialize Python project structure (`backend/`, `requirements.txt`, `main.py`)
- [x] Task: Set up SQLite database with SQLAlchemy ORM models (Team, Session, Game, Penalty)
- [x] Task: Create Pydantic request/response schemas
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Project Setup' (Protocol in workflow.md)

## Phase 2: Teams API
- [x] Task: Implement `GET /api/teams` and `GET /api/teams/{id}` endpoints
- [x] Task: Implement `POST /api/teams` endpoint with validation
- [x] Task: Implement `PUT /api/teams/{id}` endpoint
- [x] Task: Implement `DELETE /api/teams/{id}` endpoint
- [x] Task: Write tests for Teams API
- [x] Task: Conductor - User Manual Verification 'Phase 2: Teams API' (Protocol in workflow.md)

## Phase 3: Sessions API
- [x] Task: Implement `GET /api/sessions` with status filter and `GET /api/sessions/{id}`
- [x] Task: Implement `POST /api/sessions` endpoint
- [x] Task: Implement `PUT /api/sessions/{id}` (update/complete session)
- [x] Task: Implement `DELETE /api/sessions/{id}` endpoint
- [x] Task: Write tests for Sessions API
- [x] Task: Conductor - User Manual Verification 'Phase 3: Sessions API' (Protocol in workflow.md)

## Phase 4: Games & Penalties API
- [x] Task: Implement `POST /api/sessions/{id}/games` with points calculation logic
- [x] Task: Implement `DELETE /api/sessions/{id}/games/{game_id}`
- [x] Task: Implement `POST /api/sessions/{id}/penalties` and `DELETE /api/sessions/{id}/penalties/{penalty_id}`
- [x] Task: Implement `GET /api/sessions/{id}/scores` (session scoreboard)
- [x] Task: Write tests for Games & Penalties API
- [x] Task: Conductor - User Manual Verification 'Phase 4: Games & Penalties API' (Protocol in workflow.md)

## Phase 5: Stats & Data APIs
- [x] Task: Implement `GET /api/stats/leaderboard` (all-time leaderboard)
- [x] Task: Implement `POST /api/import` and `GET /api/export` endpoints
- [x] Task: Write tests for Stats & Data APIs
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Stats & Data APIs' (Protocol in workflow.md)

## Phase 6: Frontend Integration
- [ ] Task: Create API client module (`js/api.js`) with fetch wrappers
- [ ] Task: Refactor `Store` module to use API client instead of localStorage
- [ ] Task: Update `Teams` module to use async API calls
- [ ] Task: Update `Session` module to use async API calls
- [ ] Task: Update `History` and `App` modules to use async API calls
- [ ] Task: Enable CORS in FastAPI and test end-to-end
- [ ] Task: Add localStorage JSON migration tool (one-time import via UI)
- [ ] Task: Write integration tests for frontend-backend flow
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Frontend Integration' (Protocol in workflow.md)
