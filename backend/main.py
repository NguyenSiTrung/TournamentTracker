from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from database.connection import create_tables
from routers import data, games, sessions, stats, teams

# Default team colors matching the frontend ct-color-picker palette
TEAM_COLOR_PALETTE = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
    "#9b59b6", "#1abc9c", "#e67e22", "#e91e63",
]

app = FastAPI(title="Tournament Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _generate_default_tag(name: str) -> str:
    """Generate a 2-4 char uppercase tag from team name."""
    clean = name.strip()
    if len(clean) <= 4:
        return clean.upper()
    # Use first letters of words if multi-word, else first 3 chars
    words = clean.split()
    if len(words) >= 2:
        return "".join(w[0] for w in words[:4]).upper()
    return clean[:3].upper()


def _migrate_team_identity():
    """Auto-assign default color/tag to existing teams missing them.

    Also handles schema migration for SQLite: adds color/tag columns
    if they don't exist yet (since create_all won't ALTER existing tables).
    Gracefully handles cases where the table was just created with all columns.
    """
    from sqlalchemy import inspect as sa_inspect, text

    from database.connection import SessionLocal, engine
    from database.orm_models import Team as TeamModel

    inspector = sa_inspect(engine)

    # If table doesn't exist, create_tables() will handle it with correct schema
    if not inspector.has_table("teams"):
        return

    # Ensure columns exist in existing table (SQLite ALTER TABLE)
    existing_cols = {c["name"] for c in inspector.get_columns("teams")}
    with engine.begin() as conn:
        if "color" not in existing_cols:
            conn.execute(text("ALTER TABLE teams ADD COLUMN color VARCHAR"))
        if "tag" not in existing_cols:
            conn.execute(text("ALTER TABLE teams ADD COLUMN tag VARCHAR(4)"))

    # Assign defaults to teams missing color/tag
    db = SessionLocal()
    try:
        teams_needing_migration = (
            db.query(TeamModel)
            .filter((TeamModel.color.is_(None)) | (TeamModel.tag.is_(None)))
            .order_by(TeamModel.created_at)
            .all()
        )
        if not teams_needing_migration:
            return
        existing_colored_count = (
            db.query(TeamModel).filter(TeamModel.color.isnot(None)).count()
        )
        for i, team in enumerate(teams_needing_migration):
            if team.color is None:
                palette_idx = (existing_colored_count + i) % len(TEAM_COLOR_PALETTE)
                team.color = TEAM_COLOR_PALETTE[palette_idx]
            if team.tag is None:
                team.tag = _generate_default_tag(team.name)
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    create_tables()
    _migrate_team_identity()


app.include_router(teams.router)
app.include_router(sessions.router)
app.include_router(games.router)
app.include_router(stats.router)
app.include_router(data.router)

# --- Static frontend serving ---
FRONTEND_DIR = Path(__file__).resolve().parent.parent

app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")
app.mount("/images", StaticFiles(directory=FRONTEND_DIR / "images"), name="images")


@app.get("/")
def root():
    return FileResponse(FRONTEND_DIR / "index.html")
