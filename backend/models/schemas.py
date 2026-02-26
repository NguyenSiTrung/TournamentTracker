from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _strip_and_require_text(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError("Value cannot be blank")
    return normalized


SessionStatus = Literal["active", "completed"]


# --- Teams ---

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1)
    players: list[str] = Field(default_factory=list)
    color: str | None = None
    tag: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("players")
    @classmethod
    def normalize_players(cls, players: list[str]) -> list[str]:
        return [p.strip() for p in players if p and p.strip()]

    @field_validator("tag")
    @classmethod
    def normalize_tag(cls, tag: str | None) -> str | None:
        if tag is None:
            return None
        normalized = tag.strip()
        if not normalized:
            return None
        if len(normalized) > 4:
            raise ValueError("Tag must be 4 characters or fewer")
        return normalized


class TeamUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    players: list[str] = Field(default_factory=list)
    color: str | None = None
    tag: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("players")
    @classmethod
    def normalize_players(cls, players: list[str]) -> list[str]:
        return [p.strip() for p in players if p and p.strip()]

    @field_validator("tag")
    @classmethod
    def normalize_tag(cls, tag: str | None) -> str | None:
        if tag is None:
            return None
        normalized = tag.strip()
        if not normalized:
            return None
        if len(normalized) > 4:
            raise ValueError("Tag must be 4 characters or fewer")
        return normalized


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

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("team_ids")
    @classmethod
    def validate_team_ids(cls, team_ids: list[str]) -> list[str]:
        return [_strip_and_require_text(team_id) for team_id in team_ids]


class SessionUpdate(BaseModel):
    name: str | None = None
    status: SessionStatus | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_and_require_text(value)


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
    status: SessionStatus
    games: list[GameResponse] = Field(default_factory=list)
    penalties: list[PenaltyResponse] = Field(default_factory=list)


class SessionListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    date: datetime
    team_ids: list[str]
    status: SessionStatus


# --- Games ---

class GameCreate(BaseModel):
    name: str = Field(..., min_length=1)
    player_placements: dict[str, int]
    team_player_map: dict[str, list[str]]

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("player_placements")
    @classmethod
    def validate_player_placements(
        cls, player_placements: dict[str, int]
    ) -> dict[str, int]:
        if not player_placements:
            raise ValueError("At least one player placement is required")
        normalized: dict[str, int] = {}
        for player_name, position in player_placements.items():
            normalized_name = _strip_and_require_text(player_name)
            if position < 1:
                raise ValueError("Player placement must be >= 1")
            normalized[normalized_name] = position
        return normalized

    @field_validator("team_player_map")
    @classmethod
    def validate_team_player_map(
        cls, team_player_map: dict[str, list[str]]
    ) -> dict[str, list[str]]:
        if not team_player_map:
            raise ValueError("At least one team must be provided")
        normalized: dict[str, list[str]] = {}
        for team_id, players in team_player_map.items():
            normalized_team_id = _strip_and_require_text(team_id)
            normalized_players = [p.strip() for p in players if p and p.strip()]
            if not normalized_players:
                raise ValueError("Each team must include at least one player")
            normalized[normalized_team_id] = normalized_players
        return normalized


# --- Penalties ---

class PenaltyCreate(BaseModel):
    team_id: str
    value: int
    reason: str = ""

    @field_validator("team_id")
    @classmethod
    def validate_team_id(cls, value: str) -> str:
        return _strip_and_require_text(value)


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


# --- Import/Export ---


class ImportTeam(BaseModel):
    id: str | None = None
    name: str = Field(..., min_length=1)
    players: list[str] = Field(default_factory=list)
    color: str | None = None
    tag: str | None = None
    createdAt: datetime | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("players")
    @classmethod
    def normalize_players(cls, players: list[str]) -> list[str]:
        return [p.strip() for p in players if p and p.strip()]

    @field_validator("tag")
    @classmethod
    def normalize_tag(cls, tag: str | None) -> str | None:
        if tag is None:
            return None
        normalized = tag.strip()
        if not normalized:
            return None
        if len(normalized) > 4:
            raise ValueError("Tag must be 4 characters or fewer")
        return normalized


class ImportGame(BaseModel):
    id: str | None = None
    name: str = Field(..., min_length=1)
    playerPlacements: dict[str, int] = Field(default_factory=dict)
    playerPoints: dict[str, int] = Field(default_factory=dict)
    teamPlayerMap: dict[str, list[str]] = Field(default_factory=dict)
    points: dict[str, int] = Field(default_factory=dict)
    placements: dict[str, int] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)


class ImportPenalty(BaseModel):
    id: str | None = None
    teamId: str
    value: int
    reason: str = ""

    @field_validator("teamId")
    @classmethod
    def validate_team_id(cls, value: str) -> str:
        return _strip_and_require_text(value)


class ImportSession(BaseModel):
    id: str | None = None
    name: str = Field(..., min_length=1)
    date: datetime | None = None
    teamIds: list[str] = Field(..., min_length=1)
    status: SessionStatus = "active"
    games: list[ImportGame] = Field(default_factory=list)
    penalties: list[ImportPenalty] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _strip_and_require_text(value)

    @field_validator("teamIds")
    @classmethod
    def validate_team_ids(cls, team_ids: list[str]) -> list[str]:
        return [_strip_and_require_text(team_id) for team_id in team_ids]


class ImportSettings(BaseModel):
    league_name: str | None = None
    season: str | None = None
    description: str | None = None
    scoring: ScoringConfig | None = None
    scoring_2p: ScoringConfig2P | None = None


class ImportDataPayload(BaseModel):
    teams: list[ImportTeam] = Field(default_factory=list)
    sessions: list[ImportSession] = Field(default_factory=list)
    settings: ImportSettings | None = None
