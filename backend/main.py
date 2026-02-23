from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def root():
    return {"message": "Tournament Tracker API"}
