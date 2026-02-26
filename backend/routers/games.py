import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Game, Penalty, Session, Setting, Team
from models.schemas import (
    GameCreate,
    GameResponse,
    PenaltyCreate,
    PenaltyResponse,
    SessionScoreEntry,
)

router = APIRouter(prefix="/api/sessions", tags=["games", "penalties"])


def _get_scoring_config(db: DBSession) -> tuple[dict[int, int], dict[int, int]]:
    """Read scoring configuration from settings table.

    Returns (standard_scoring, two_player_scoring) as {position: points} dicts.
    Falls back to defaults if not configured.
    """
    default_std = {1: 4, 2: 3, 3: 2, 4: 1}
    default_2p = {1: 4, 2: 1}

    scoring_row = db.query(Setting).filter(Setting.key == "scoring").first()
    scoring_2p_row = db.query(Setting).filter(Setting.key == "scoring_2p").first()

    if scoring_row:
        raw = json.loads(scoring_row.value)
        std = {1: raw.get("first", 4), 2: raw.get("second", 3),
               3: raw.get("third", 2), 4: raw.get("fourth", 1)}
    else:
        std = default_std

    if scoring_2p_row:
        raw = json.loads(scoring_2p_row.value)
        two_p = {1: raw.get("first", 4), 2: raw.get("second", 1)}
    else:
        two_p = default_2p

    return std, two_p


def _calculate_points(position: int, num_players: int, db: DBSession) -> int:
    std, two_p = _get_scoring_config(db)
    if num_players <= 2:
        return two_p.get(position, two_p.get(2, 1))
    return std.get(position, std.get(4, 1))


def _get_session_or_404(session_id: str, db: DBSession) -> Session:
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def _assert_session_teams_exist(session: Session, db: DBSession) -> None:
    if not session.team_ids:
        return
    existing_team_ids = {
        team_id
        for (team_id,) in db.query(Team.id).filter(Team.id.in_(session.team_ids)).all()
    }
    missing_team_ids = sorted(set(session.team_ids) - existing_team_ids)
    if missing_team_ids:
        missing = ", ".join(missing_team_ids)
        raise HTTPException(
            status_code=422,
            detail=f"Session references unknown team ids: {missing}",
        )


def _validate_session_team_ids(
    session: Session, candidate_team_ids: set[str], field_name: str
) -> None:
    unknown_team_ids = sorted(candidate_team_ids - set(session.team_ids))
    if unknown_team_ids:
        unknown = ", ".join(unknown_team_ids)
        raise HTTPException(
            status_code=422,
            detail=f"{field_name} contains team ids not in session: {unknown}",
        )


# --- Games ---


@router.post("/{session_id}/games", response_model=GameResponse, status_code=201)
def add_game(
    session_id: str, body: GameCreate, db: DBSession = Depends(get_db)
) -> GameResponse:
    session = _get_session_or_404(session_id, db)
    _assert_session_teams_exist(session, db)
    _validate_session_team_ids(
        session, set(body.team_player_map.keys()), "team_player_map"
    )

    total_players = len(body.player_placements)

    player_points = {
        key: _calculate_points(pos, total_players, db)
        for key, pos in body.player_placements.items()
    }

    # Aggregate team points and placements from composite keys.
    # Keys may be "teamId::playerName" (new) or "playerName" (legacy).
    points: dict[str, int] = {}
    placements: dict[str, int] = {}
    for team_id, players in body.team_player_map.items():
        team_total = 0
        best_pos = 999
        for p_name in players:
            composite_key = f"{team_id}::{p_name}"
            # Try composite key first, fall back to plain name for legacy data
            if composite_key in player_points:
                team_total += player_points[composite_key]
            elif p_name in player_points:
                team_total += player_points[p_name]
            if composite_key in body.player_placements:
                best_pos = min(best_pos, body.player_placements[composite_key])
            elif p_name in body.player_placements:
                best_pos = min(best_pos, body.player_placements[p_name])
        points[team_id] = team_total
        placements[team_id] = best_pos

    game = Game(
        session_id=session_id,
        name=body.name,
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
    session = _get_session_or_404(session_id, db)
    _assert_session_teams_exist(session, db)
    if body.team_id not in set(session.team_ids):
        raise HTTPException(
            status_code=422,
            detail="Penalty team_id must belong to the session",
        )

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
