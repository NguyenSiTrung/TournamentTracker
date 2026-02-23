from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.connection import Base
from database.orm_models import Game, Penalty, Session, Team


def _make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


def test_create_team():
    db = _make_session()
    team = Team(name="Alpha", players=["Alice", "Bob"])
    db.add(team)
    db.commit()
    db.refresh(team)
    assert team.id is not None
    assert team.name == "Alpha"
    assert team.players == ["Alice", "Bob"]


def test_create_session_with_games_and_penalties():
    db = _make_session()
    session = Session(name="Round 1", team_ids=["t1", "t2"])
    db.add(session)
    db.commit()
    db.refresh(session)

    game = Game(
        session_id=session.id,
        name="Game 1",
        player_placements={"Alice": 1, "Bob": 2},
        player_points={"Alice": 4, "Bob": 3},
        team_player_map={"t1": ["Alice"], "t2": ["Bob"]},
        points={"t1": 4, "t2": 3},
        placements={"t1": 1, "t2": 2},
    )
    penalty = Penalty(session_id=session.id, team_id="t1", value=-1, reason="Late")
    db.add_all([game, penalty])
    db.commit()

    db.refresh(session)
    assert len(session.games) == 1
    assert len(session.penalties) == 1
    assert session.games[0].name == "Game 1"
    assert session.penalties[0].value == -1


def test_cascade_delete_session():
    db = _make_session()
    session = Session(name="Round 2", team_ids=["t1"])
    db.add(session)
    db.commit()

    game = Game(session_id=session.id, name="G1", points={}, placements={})
    penalty = Penalty(session_id=session.id, team_id="t1", value=-2)
    db.add_all([game, penalty])
    db.commit()

    db.delete(session)
    db.commit()

    assert db.query(Game).count() == 0
    assert db.query(Penalty).count() == 0
