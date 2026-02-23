# Plan: Backend API & Frontend Integration MVP

## Phase 1: Backend Project Setup
- [x] Task: Initialize Python project structure (`backend/`, `requirements.txt`, `main.py`)
- [ ] Task: Set up SQLite database with SQLAlchemy ORM models (Team, Session, Game, Penalty)
- [ ] Task: Create Pydantic request/response schemas
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Project Setup' (Protocol in workflow.md)

## Phase 2: Teams API
- [ ] Task: Implement `GET /api/teams` and `GET /api/teams/{id}` endpoints
- [ ] Task: Implement `POST /api/teams` endpoint with validation
- [ ] Task: Implement `PUT /api/teams/{id}` endpoint
- [ ] Task: Implement `DELETE /api/teams/{id}` endpoint
- [ ] Task: Write tests for Teams API
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Teams API' (Protocol in workflow.md)

## Phase 3: Sessions API
- [ ] Task: Implement `GET /api/sessions` with status filter and `GET /api/sessions/{id}`
- [ ] Task: Implement `POST /api/sessions` endpoint
- [ ] Task: Implement `PUT /api/sessions/{id}` (update/complete session)
- [ ] Task: Implement `DELETE /api/sessions/{id}` endpoint
- [ ] Task: Write tests for Sessions API
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Sessions API' (Protocol in workflow.md)

## Phase 4: Games & Penalties API
- [ ] Task: Implement `POST /api/sessions/{id}/games` with points calculation logic
- [ ] Task: Implement `DELETE /api/sessions/{id}/games/{game_id}`
- [ ] Task: Implement `POST /api/sessions/{id}/penalties` and `DELETE /api/sessions/{id}/penalties/{penalty_id}`
- [ ] Task: Implement `GET /api/sessions/{id}/scores` (session scoreboard)
- [ ] Task: Write tests for Games & Penalties API
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Games & Penalties API' (Protocol in workflow.md)

## Phase 5: Stats & Data APIs
- [ ] Task: Implement `GET /api/stats/leaderboard` (all-time leaderboard)
- [ ] Task: Implement `POST /api/import` and `GET /api/export` endpoints
- [ ] Task: Write tests for Stats & Data APIs
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
