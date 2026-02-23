# Spec: Backend API & Frontend Integration MVP

## Overview
Build a FastAPI backend with SQLite persistence for all existing Tournament Tracker features and migrate the frontend from localStorage to API consumption.

## Requirements

### Functional Requirements
1. **Teams API** — CRUD operations for teams and their players
   - `GET /api/teams` — List all teams
   - `GET /api/teams/{id}` — Get single team
   - `POST /api/teams` — Create team with name and players
   - `PUT /api/teams/{id}` — Update team name and players
   - `DELETE /api/teams/{id}` — Delete team

2. **Sessions API** — CRUD operations for game sessions
   - `GET /api/sessions` — List all sessions (with optional `?status=active|completed` filter)
   - `GET /api/sessions/{id}` — Get session with games, penalties, and scores
   - `POST /api/sessions` — Create session with name and team IDs
   - `PUT /api/sessions/{id}` — Update session (e.g., complete it)
   - `DELETE /api/sessions/{id}` — Delete session

3. **Games API** — Manage games within a session
   - `POST /api/sessions/{id}/games` — Add game with player placements
   - `DELETE /api/sessions/{id}/games/{game_id}` — Remove game

4. **Penalties API** — Manage penalties within a session
   - `POST /api/sessions/{id}/penalties` — Add penalty (team, value, reason)
   - `DELETE /api/sessions/{id}/penalties/{penalty_id}` — Remove penalty

5. **Stats API** — Computed statistics
   - `GET /api/stats/leaderboard` — All-time leaderboard
   - `GET /api/sessions/{id}/scores` — Session scoreboard

6. **Data Migration**
   - `POST /api/import` — Import existing localStorage JSON dump
   - `GET /api/export` — Export all data as JSON

7. **Frontend Integration**
   - Replace all `Store.*` localStorage calls with `fetch()` API calls
   - Maintain identical UI behavior and user experience
   - CORS enabled for frontend-backend communication

### Non-Functional Requirements
- API auto-documented via FastAPI Swagger UI (`/docs`)
- Points calculation logic preserved exactly (1st=4, 2nd=3, 3rd=2, 4th+=1)
- All user input validated via Pydantic models
- SQLite database file stored in `backend/data/` directory

## Data Model

### Team
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Team name |
| players | list[string] | Player names |
| created_at | datetime | Creation timestamp |

### Session
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Session name |
| date | datetime | Session date |
| team_ids | list[string] | Participating team IDs |
| status | string | "active" or "completed" |

### Game
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| session_id | string | Parent session |
| name | string | Game name |
| player_placements | dict | {player_name: position} |
| player_points | dict | {player_name: points} |
| team_player_map | dict | {team_id: [player_names]} |
| points | dict | {team_id: total_points} |
| placements | dict | {team_id: best_position} |

### Penalty
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| session_id | string | Parent session |
| team_id | string | Penalized team |
| value | int | Negative point value |
| reason | string | Optional reason |
