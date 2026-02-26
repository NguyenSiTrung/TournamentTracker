from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Team
from models.schemas import TeamCreate, TeamResponse, TeamUpdate

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def list_teams(db: DBSession = Depends(get_db)) -> list[TeamResponse]:
    return db.query(Team).all()


@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: str, db: DBSession = Depends(get_db)) -> TeamResponse:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.post("", response_model=TeamResponse, status_code=201)
def create_team(body: TeamCreate, db: DBSession = Depends(get_db)) -> TeamResponse:
    team = Team(
        name=body.name.strip(),
        players=[p.strip() for p in body.players if p.strip()],
        color=body.color,
        tag=body.tag.strip()[:4] if body.tag else None,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamResponse)
def update_team(
    team_id: str, body: TeamUpdate, db: DBSession = Depends(get_db)
) -> TeamResponse:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team.name = body.name.strip()
    team.players = [p.strip() for p in body.players if p.strip()]
    team.color = body.color
    team.tag = body.tag.strip()[:4] if body.tag else None
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: str, db: DBSession = Depends(get_db)) -> None:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
