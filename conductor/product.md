# Product Guide: Tournament Tracker

## Vision
Tournament Tracker is a web application for friend groups to track casual game nights — recording sessions, scores, and team rankings across board games, card games, and party games.

## Target Users
- Friend groups who regularly play games together

## Core Features
1. **Team & Player Management** — Create teams with individual players; per-player scoring rolls up to team totals
2. **Session-Based Game Tracking** — Start sessions, add games with player placements, view a live scoreboard
3. **All-Time Leaderboard & Statistics** — Historical rankings, win counts, total points, and per-session averages
4. **Penalties System** — Apply point penalties with reasons during active sessions
5. **Data Import/Export** — JSON-based backup and restore of all tournament data

## Platform & Architecture
- **Frontend:** Web browser — vanilla HTML/CSS/JavaScript (single-page app)
- **Backend:** Python (FastAPI) — to be added, replacing localStorage with server-side persistence
- **Deployment:** Web frontend and FastAPI backend deployed on a server

## Non-Goals (Current Scope)
- Real-time multiplayer / WebSocket sync
- User authentication / multi-user accounts
- Mobile native apps
