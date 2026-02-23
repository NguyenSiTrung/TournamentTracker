> **Last Refreshed:** 2026-02-24 — Context synced with codebase

# Tech Stack: Tournament Tracker

## Frontend
- **Language:** HTML5, CSS3, JavaScript (ES6+)
- **Framework:** None — vanilla JS with Module/IIFE pattern
- **Architecture:** Single-page application with tab-based navigation
- **Styling:** Custom CSS with CSS custom properties, glassmorphism design, keyframe animations
- **Fonts:** Google Fonts (Inter, Space Grotesk)
- **Build Tools:** None (no bundler, no transpiler)
- **Serving:** Static files served by FastAPI backend (`StaticFiles` + `FileResponse`)

## Backend
- **Language:** Python 3.x
- **Framework:** FastAPI
- **API Style:** RESTful JSON API
- **Server:** Uvicorn (ASGI)
- **ORM:** SQLAlchemy 2.x with declarative ORM models
- **Validation:** Pydantic 2.x (`ConfigDict` with `from_attributes=True`)
- **Routers:** One file per resource in `backend/routers/` (teams, sessions, games, stats, data)
- **Testing:** pytest + pytest-asyncio, Starlette TestClient

## Storage
- **Database:** SQLite (via SQLAlchemy, file-based at `backend/data/tournament.db`)
- **ORM Models:** Team, Session, Game, Score, Penalty (in `backend/database/orm_models.py`)

## Dependencies

### Python (backend/requirements.txt)
- `fastapi>=0.109.0`
- `uvicorn[standard]>=0.27.0`
- `sqlalchemy>=2.0.0`
- `pydantic>=2.0.0`
- `httpx>=0.27.0` (test HTTP client)
- `pytest>=8.0.0`
- `pytest-asyncio>=0.23.0`

### Frontend
- Zero npm dependencies
- Google Fonts CDN (Inter, Space Grotesk)

## DevOps / Deployment
- **Version Control:** Git
- **Deployment:** FastAPI backend serves both API and frontend static files
- **Virtual Environment:** Python venv (required — system Python is PEP 668 managed)
