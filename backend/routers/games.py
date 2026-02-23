from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Game, Penalty, Session
from models.schemas import (
    GameCreate,
    GameResponse,
    PenaltyCreate,
    PenaltyResponse,
    SessionScoreEntry,
)

router = APIRouter(prefix="/api/sessions", tags=["games", "penalties"])


def _calculate_points(position: int, num_players: int) -> int:
    if num_players <= 2:
        return 4 if position == 1 else 1
    if position == 1:
        return 4
    if position == 2:
        return 3
    if position == 3:
        return 2
    return 1


def _get_session_or_404(session_id: str, db: DBSession) -> Session:
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


# --- Games ---


@router.post("/{session_id}/games", response_model=GameResponse, status_code=201)
def add_game(
    session_id: str, body: GameCreate, db: DBSession = Depends(get_db)
) -> GameResponse:
    _get_session_or_404(session_id, db)

    total_players = len(body.player_placements)

    player_points = {
        name: _calculate_points(pos, total_players)
        for name, pos in body.player_placements.items()
    }

    points: dict[str, int] = {}
    placements: dict[str, int] = {}
    for team_id, players in body.team_player_map.items():
        team_total = 0
        best_pos = 999
        for p_name in players:
            if p_name in player_points:
                team_total += player_points[p_name]
            if p_name in body.player_placements:
                best_pos = min(best_pos, body.player_placements[p_name])
        points[team_id] = team_total
        placements[team_id] = best_pos

    game = Game(
        session_id=session_id,
        name=body.name.strip(),
        player_placements=body.player_placements,
        player_points=player_points,
        team_player_map=body.team_player_map,
        points=points,
        placements=placements,
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@router.delete("/{session_id}/games/{game_id}", status_code=204)
def remove_game(
    session_id: str, game_id: str, db: DBSession = Depends(get_db)
) -> None:
    game = (
        db.query(Game)
        .filter(Game.session_id == session_id, Game.id == game_id)
        .first()
    )
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    db.delete(game)
    db.commit()


# --- Penalties ---


@router.post(
    "/{session_id}/penalties", response_model=PenaltyResponse, status_code=201
)
def add_penalty(
    session_id: str, body: PenaltyCreate, db: DBSession = Depends(get_db)
) -> PenaltyResponse:
    _get_session_or_404(session_id, db)
    penalty = Penalty(
        session_id=session_id,
        team_id=body.team_id,
        value=body.value,
        reason=body.reason,
    )
    db.add(penalty)
    db.commit()
    db.refresh(penalty)
    return penalty


@router.delete("/{session_id}/penalties/{penalty_id}", status_code=204)
def remove_penalty(
    session_id: str, penalty_id: str, db: DBSession = Depends(get_db)
) -> None:
    penalty = (
        db.query(Penalty)
        .filter(Penalty.session_id == session_id, Penalty.id == penalty_id)
        .first()
    )
    if not penalty:
        raise HTTPException(status_code=404, detail="Penalty not found")
    db.delete(penalty)
    db.commit()


# --- Scores ---


@router.get("/{session_id}/scores", response_model=list[SessionScoreEntry])
def get_session_scores(
    session_id: str, db: DBSession = Depends(get_db)
) -> list[SessionScoreEntry]:
    session = _get_session_or_404(session_id, db)

    scores: dict[str, dict[str, int]] = {}
    for tid in session.team_ids:
        scores[tid] = {"game_points": 0, "penalty_points": 0, "total": 0}

    for game in session.games:
        for team_id, pts in game.points.items():
            if team_id in scores:
                scores[team_id]["game_points"] += pts

    for penalty in session.penalties:
        if penalty.team_id in scores:
            scores[penalty.team_id]["penalty_points"] += penalty.value

    result = []
    for tid, s in scores.items():
        s["total"] = s["game_points"] + s["penalty_points"]
        result.append(SessionScoreEntry(team_id=tid, **s))

    result.sort(key=lambda x: x.total, reverse=True)
    return result
