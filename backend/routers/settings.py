import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Setting
from models.schemas import (
    ScoringConfig,
    ScoringConfig2P,
    SettingsResponse,
    SettingsUpdate,
)

router = APIRouter(prefix="/api", tags=["settings"])


def _get_all_settings(db: DBSession) -> dict[str, str]:
    """Read all settings from the database as a key-value dict."""
    rows = db.query(Setting).all()
    return {row.key: row.value for row in rows}


def _build_settings_response(raw: dict[str, str]) -> SettingsResponse:
    """Convert raw key-value settings into a structured response."""
    scoring_raw = raw.get("scoring")
    scoring_2p_raw = raw.get("scoring_2p")

    scoring = ScoringConfig(**json.loads(scoring_raw)) if scoring_raw else ScoringConfig()
    scoring_2p = ScoringConfig2P(**json.loads(scoring_2p_raw)) if scoring_2p_raw else ScoringConfig2P()

    return SettingsResponse(
        league_name=raw.get("league_name", "Pro League"),
        season=raw.get("season", "Season 4"),
        description=raw.get("description", ""),
        scoring=scoring,
        scoring_2p=scoring_2p,
    )


@router.get("/settings", response_model=SettingsResponse)
def get_settings(db: DBSession = Depends(get_db)) -> SettingsResponse:
    raw = _get_all_settings(db)
    return _build_settings_response(raw)


@router.put("/settings", response_model=SettingsResponse)
def update_settings(
    body: SettingsUpdate, db: DBSession = Depends(get_db)
) -> SettingsResponse:
    updates: dict[str, str] = {}

    if body.league_name is not None:
        updates["league_name"] = body.league_name
    if body.season is not None:
        updates["season"] = body.season
    if body.description is not None:
        updates["description"] = body.description
    if body.scoring is not None:
        updates["scoring"] = json.dumps(body.scoring.model_dump())
    if body.scoring_2p is not None:
        updates["scoring_2p"] = json.dumps(body.scoring_2p.model_dump())

    for key, value in updates.items():
        existing = db.query(Setting).filter(Setting.key == key).first()
        if existing:
            existing.value = value
        else:
            db.add(Setting(key=key, value=value))

    db.commit()

    raw = _get_all_settings(db)
    return _build_settings_response(raw)
