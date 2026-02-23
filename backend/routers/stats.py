from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Game, Penalty, Session
from models.schemas import LeaderboardEntry

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(
    db: DBSession = Depends(get_db),
) -> list[LeaderboardEntry]:
    completed = (
        db.query(Session).filter(Session.status == "completed").all()
    )

    scores: dict[str, dict[str, int]] = {}

    for session in completed:
        session_scores: dict[str, int] = {}

        for tid in session.team_ids:
            session_scores[tid] = 0
            if tid not in scores:
                scores[tid] = {"total_points": 0, "wins": 0, "sessions": 0}

        for game in session.games:
            for team_id, pts in game.points.items():
                if team_id in session_scores:
                    session_scores[team_id] += pts

        for penalty in session.penalties:
            if penalty.team_id in session_scores:
                session_scores[penalty.team_id] += penalty.value

        for tid, total in session_scores.items():
            if tid in scores:
                scores[tid]["total_points"] += total
                scores[tid]["sessions"] += 1

        if session_scores:
            winner = max(session_scores, key=session_scores.get)
            if winner in scores:
                scores[winner]["wins"] += 1

    return sorted(
        [LeaderboardEntry(team_id=tid, **s) for tid, s in scores.items()],
        key=lambda x: x.total_points,
        reverse=True,
    )
