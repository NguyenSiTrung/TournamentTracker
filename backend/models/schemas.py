from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Teams ---

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1)
    players: list[str] = Field(default_factory=list)
    color: str | None = None
    tag: str | None = Field(default=None, max_length=4)


class TeamUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    players: list[str] = Field(default_factory=list)
    color: str | None = None
    tag: str | None = Field(default=None, max_length=4)


class TeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    players: list[str]
    color: str | None = None
    tag: str | None = None
    created_at: datetime


# --- Sessions ---

class SessionCreate(BaseModel):
    name: str = Field(..., min_length=1)
    team_ids: list[str] = Field(..., min_length=1)


class SessionUpdate(BaseModel):
    name: str | None = None
    status: str | None = None


class PenaltyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    team_id: str
    value: int
    reason: str


class GameResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    name: str
    player_placements: dict[str, int]
    player_points: dict[str, int]
    team_player_map: dict[str, list[str]]
    points: dict[str, int]
    placements: dict[str, int]


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    date: datetime
    team_ids: list[str]
    status: str
    games: list[GameResponse] = Field(default_factory=list)
    penalties: list[PenaltyResponse] = Field(default_factory=list)


class SessionListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    date: datetime
    team_ids: list[str]
    status: str


# --- Games ---

class GameCreate(BaseModel):
    name: str = Field(..., min_length=1)
    player_placements: dict[str, int]
    team_player_map: dict[str, list[str]]


# --- Penalties ---

class PenaltyCreate(BaseModel):
    team_id: str
    value: int
    reason: str = ""


# --- Stats ---

class LeaderboardEntry(BaseModel):
    team_id: str
    total_points: int
    wins: int
    sessions: int


class SessionScoreEntry(BaseModel):
    team_id: str
    game_points: int
    penalty_points: int
    total: int


# --- Settings ---

class ScoringConfig(BaseModel):
    first: int = 4
    second: int = 3
    third: int = 2
    fourth: int = 1


class ScoringConfig2P(BaseModel):
    first: int = 4
    second: int = 1


class SettingsResponse(BaseModel):
    league_name: str = "Pro League"
    season: str = "Season 4"
    description: str = ""
    scoring: ScoringConfig = Field(default_factory=ScoringConfig)
    scoring_2p: ScoringConfig2P = Field(default_factory=ScoringConfig2P)


class SettingsUpdate(BaseModel):
    league_name: str | None = None
    season: str | None = None
    description: str | None = None
    scoring: ScoringConfig | None = None
    scoring_2p: ScoringConfig2P | None = None
