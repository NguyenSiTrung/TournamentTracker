import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


def _generate_id() -> str:
    return uuid.uuid4().hex[:12]


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_generate_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    players: Mapped[list] = mapped_column(JSON, default=list)
    color: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    tag: Mapped[str | None] = mapped_column(String(4), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_generate_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    team_ids: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String, default="active")

    games: Mapped[list["Game"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    penalties: Mapped[list["Penalty"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class Game(Base):
    __tablename__ = "games"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_generate_id)
    session_id: Mapped[str] = mapped_column(
        String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    player_placements: Mapped[dict] = mapped_column(JSON, default=dict)
    player_points: Mapped[dict] = mapped_column(JSON, default=dict)
    team_player_map: Mapped[dict] = mapped_column(JSON, default=dict)
    points: Mapped[dict] = mapped_column(JSON, default=dict)
    placements: Mapped[dict] = mapped_column(JSON, default=dict)

    session: Mapped["Session"] = relationship(back_populates="games")


class Penalty(Base):
    __tablename__ = "penalties"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_generate_id)
    session_id: Mapped[str] = mapped_column(
        String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String, default="")

    session: Mapped["Session"] = relationship(back_populates="penalties")
