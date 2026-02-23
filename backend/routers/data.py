from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Game, Penalty, Session, Team

router = APIRouter(prefix="/api", tags=["data"])


class ImportData(BaseModel):
    teams: list[dict]
    sessions: list[dict]


@router.get("/export")
def export_data(db: DBSession = Depends(get_db)) -> dict:
    teams = db.query(Team).all()
    sessions = db.query(Session).all()

    teams_out = []
    for t in teams:
        teams_out.append({
            "id": t.id,
            "name": t.name,
            "players": t.players,
            "createdAt": t.created_at.isoformat() if t.created_at else None,
        })

    sessions_out = []
    for s in sessions:
        games_out = []
        for g in s.games:
            games_out.append({
                "id": g.id,
                "name": g.name,
                "playerPlacements": g.player_placements,
                "playerPoints": g.player_points,
                "teamPlayerMap": g.team_player_map,
                "points": g.points,
                "placements": g.placements,
            })

        penalties_out = []
        for p in s.penalties:
            penalties_out.append({
                "id": p.id,
                "teamId": p.team_id,
                "value": p.value,
                "reason": p.reason,
            })

        sessions_out.append({
            "id": s.id,
            "name": s.name,
            "date": s.date.isoformat() if s.date else None,
            "teamIds": s.team_ids,
            "status": s.status,
            "games": games_out,
            "penalties": penalties_out,
        })

    return {"teams": teams_out, "sessions": sessions_out}


@router.post("/import", status_code=201)
def import_data(body: ImportData, db: DBSession = Depends(get_db)) -> dict:
    if not body.teams and not body.sessions:
        raise HTTPException(status_code=422, detail="No data to import")

    teams_count = 0
    for t in body.teams:
        team = Team(
            id=t.get("id"),
            name=t.get("name", ""),
            players=t.get("players", []),
        )
        db.merge(team)
        teams_count += 1

    sessions_count = 0
    for s in body.sessions:
        date_val = s.get("date")
        if isinstance(date_val, str):
            date_val = datetime.fromisoformat(date_val)

        session = Session(
            id=s.get("id"),
            name=s.get("name", ""),
            date=date_val,
            team_ids=s.get("teamIds", []),
            status=s.get("status", "active"),
        )
        db.merge(session)
        db.flush()

        for g in s.get("games", []):
            game = Game(
                id=g.get("id"),
                session_id=session.id,
                name=g.get("name", ""),
                player_placements=g.get("playerPlacements", {}),
                player_points=g.get("playerPoints", {}),
                team_player_map=g.get("teamPlayerMap", {}),
                points=g.get("points", {}),
                placements=g.get("placements", {}),
            )
            db.merge(game)

        for p in s.get("penalties", []):
            penalty = Penalty(
                id=p.get("id"),
                session_id=session.id,
                team_id=p.get("teamId", ""),
                value=p.get("value", 0),
                reason=p.get("reason", ""),
            )
            db.merge(penalty)

        sessions_count += 1

    db.commit()
    return {"imported": {"teams": teams_count, "sessions": sessions_count}}
