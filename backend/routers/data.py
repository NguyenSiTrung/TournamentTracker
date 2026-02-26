import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Game, Penalty, Session, Setting, Team
from models.schemas import (
    ImportDataPayload,
    ImportSettings,
    ScoringConfig,
    ScoringConfig2P,
)

router = APIRouter(prefix="/api", tags=["data"])

class ResetRequest(BaseModel):
    teams: bool = False
    sessions: bool = False
    settings: bool = False


def _validate_team_ids_exist(team_ids: list[str], db: DBSession) -> None:
    if not team_ids:
        return
    existing_team_ids = {
        team_id
        for (team_id,) in db.query(Team.id).filter(Team.id.in_(team_ids)).all()
    }
    missing_team_ids = sorted(set(team_ids) - existing_team_ids)
    if missing_team_ids:
        missing = ", ".join(missing_team_ids)
        raise HTTPException(status_code=422, detail=f"Unknown team_ids: {missing}")


def _build_settings_export(db: DBSession) -> dict:
    raw_settings = {row.key: row.value for row in db.query(Setting).all()}
    scoring = (
        json.loads(raw_settings["scoring"])
        if "scoring" in raw_settings
        else ScoringConfig().model_dump()
    )
    scoring_2p = (
        json.loads(raw_settings["scoring_2p"])
        if "scoring_2p" in raw_settings
        else ScoringConfig2P().model_dump()
    )
    return {
        "league_name": raw_settings.get("league_name", "Pro League"),
        "season": raw_settings.get("season", "Season 4"),
        "description": raw_settings.get("description", ""),
        "scoring": scoring,
        "scoring_2p": scoring_2p,
    }


def _upsert_import_settings(settings: ImportSettings, db: DBSession) -> int:
    updates: dict[str, str] = {}
    if settings.league_name is not None:
        updates["league_name"] = settings.league_name
    if settings.season is not None:
        updates["season"] = settings.season
    if settings.description is not None:
        updates["description"] = settings.description
    if settings.scoring is not None:
        updates["scoring"] = json.dumps(settings.scoring.model_dump())
    if settings.scoring_2p is not None:
        updates["scoring_2p"] = json.dumps(settings.scoring_2p.model_dump())

    for key, value in updates.items():
        existing = db.query(Setting).filter(Setting.key == key).first()
        if existing:
            existing.value = value
        else:
            db.add(Setting(key=key, value=value))
    return len(updates)


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
            "color": t.color,
            "tag": t.tag,
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

    return {
        "teams": teams_out,
        "sessions": sessions_out,
        "settings": _build_settings_export(db),
    }


@router.post("/import", status_code=201)
def import_data(body: ImportDataPayload, db: DBSession = Depends(get_db)) -> dict:
    if not body.teams and not body.sessions and body.settings is None:
        raise HTTPException(status_code=422, detail="No data to import")

    teams_count = 0
    for t in body.teams:
        team = Team(
            id=t.id,
            name=t.name,
            players=t.players,
            color=t.color,
            tag=t.tag,
            created_at=t.createdAt,
        )
        db.merge(team)
        teams_count += 1

    db.flush()

    sessions_count = 0
    for s in body.sessions:
        _validate_team_ids_exist(s.teamIds, db)

        session = Session(
            id=s.id,
            name=s.name,
            date=s.date,
            team_ids=s.teamIds,
            status=s.status,
        )
        db.merge(session)
        db.flush()

        for g in s.games:
            unknown_game_team_ids = sorted(
                set(g.teamPlayerMap.keys()) - set(s.teamIds)
            )
            if unknown_game_team_ids:
                unknown = ", ".join(unknown_game_team_ids)
                raise HTTPException(
                    status_code=422,
                    detail=(
                        "Game teamPlayerMap contains team ids not in session: "
                        f"{unknown}"
                    ),
                )

            game = Game(
                id=g.id,
                session_id=session.id,
                name=g.name,
                player_placements=g.playerPlacements,
                player_points=g.playerPoints,
                team_player_map=g.teamPlayerMap,
                points=g.points,
                placements=g.placements,
            )
            db.merge(game)

        for p in s.penalties:
            if p.teamId not in set(s.teamIds):
                raise HTTPException(
                    status_code=422,
                    detail="Penalty teamId must belong to the session teamIds",
                )

            penalty = Penalty(
                id=p.id,
                session_id=session.id,
                team_id=p.teamId,
                value=p.value,
                reason=p.reason,
            )
            db.merge(penalty)

        sessions_count += 1

    settings_count = (
        _upsert_import_settings(body.settings, db) if body.settings is not None else 0
    )

    db.commit()
    return {
        "imported": {
            "teams": teams_count,
            "sessions": sessions_count,
            "settings": settings_count,
        }
    }


@router.delete("/data/reset")
def reset_data(body: ResetRequest, db: DBSession = Depends(get_db)) -> dict:
    """Selectively reset data categories."""
    if not body.teams and not body.sessions and not body.settings:
        raise HTTPException(status_code=422, detail="No reset categories selected")

    deleted = {}

    if body.sessions:
        # Delete games and penalties first (cascade), then sessions
        db.query(Penalty).delete()
        db.query(Game).delete()
        db.query(Session).delete()
        deleted["sessions"] = True

    if body.teams:
        db.query(Team).delete()
        deleted["teams"] = True

    if body.settings:
        db.query(Setting).delete()
        deleted["settings"] = True

    db.commit()
    return {"reset": deleted}
