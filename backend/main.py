from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from database.connection import create_tables
from routers import data, games, sessions, stats, teams

app = FastAPI(title="Tournament Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


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
