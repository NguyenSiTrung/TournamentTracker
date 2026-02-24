> **Last Refreshed:** 2026-02-24T17:41 — Context synced with codebase

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

## Shipped Features (Post-MVP)
6. **Backend API & Persistence** — Full RESTful API (FastAPI) replacing localStorage with SQLite database; endpoints for teams, sessions, games, stats, and data import/export
7. **Dashboard Redesign** — Rich dashboard with animated stat counters, leaderboard podium (top-3 visual), CSS bar chart for win distribution, quick action buttons, illustrated empty states, and skeleton loading placeholders
8. **Game Result Modal Redesign** — Card-based game result entry with live winner/score preview, optional inline penalty application, and scoped modal variant styling
9. **Live Session Dashboard** — Redesigned sessions tab with live dashboard view
10. **UI/UX Polish** — Tab crossfade transitions, navigation badges (pulsing active session dot, history count), section-specific color accents, responsive layout (768px/480px breakpoints), `prefers-reduced-motion` accessibility support
11. **WCAG AA Contrast Compliance** — Design token-level contrast audit and fix; all text, form elements, and interactive components meet WCAG AA ratios on the dark green theme
12. **Empty State Illustrations** — Inline SVG illustrated hero cards with glassmorphism for Teams, Dashboard (Leaderboard), and History views; BEM-scoped `.empty-state-hero-card` component; horizontal stepper onboarding guide for Teams

## Platform & Architecture
- **Frontend:** Web browser — vanilla HTML/CSS/JavaScript (single-page app)
- **Backend:** Python (FastAPI) with SQLAlchemy ORM and SQLite database
- **Serving:** FastAPI serves both the REST API and the frontend static files
- **Deployment:** Single FastAPI server handles everything (API + frontend)

## Non-Goals (Current Scope)
- Real-time multiplayer / WebSocket sync
- User authentication / multi-user accounts
- Mobile native apps
