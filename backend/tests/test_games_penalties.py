import pytest


@pytest.fixture()
def session_id(client):
    import_resp = client.post(
        "/api/import",
        json={
            "teams": [
                {"id": "t1", "name": "Team 1", "players": ["Alice", "Bob"]},
                {"id": "t2", "name": "Team 2", "players": ["Carol", "Dave"]},
            ]
        },
    )
    assert import_resp.status_code == 201
    resp = client.post("/api/sessions", json={"name": "R1", "team_ids": ["t1", "t2"]})
    return resp.json()["id"]


GAME_BODY = {
    "name": "Game 1",
    "player_placements": {"Alice": 1, "Bob": 2, "Carol": 3, "Dave": 4},
    "team_player_map": {"t1": ["Alice", "Bob"], "t2": ["Carol", "Dave"]},
}


# --- Games ---


def test_add_game(client, session_id):
    resp = client.post(f"/api/sessions/{session_id}/games", json=GAME_BODY)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Game 1"
    # Alice=4, Bob=3 → t1=7; Carol=2, Dave=1 → t2=3
    assert data["points"] == {"t1": 7, "t2": 3}
    assert data["player_points"] == {"Alice": 4, "Bob": 3, "Carol": 2, "Dave": 1}
    assert data["placements"] == {"t1": 1, "t2": 3}


def test_add_game_two_players(client, session_id):
    body = {
        "name": "Duel",
        "player_placements": {"Alice": 1, "Bob": 2},
        "team_player_map": {"t1": ["Alice"], "t2": ["Bob"]},
    }
    resp = client.post(f"/api/sessions/{session_id}/games", json=body)
    assert resp.status_code == 201
    # 2 players: 1st=4, 2nd=1
    assert resp.json()["player_points"] == {"Alice": 4, "Bob": 1}


def test_add_game_session_not_found(client):
    resp = client.post("/api/sessions/nonexistent/games", json=GAME_BODY)
    assert resp.status_code == 404


def test_add_game_team_not_in_session_rejected(client, session_id):
    invalid_body = {
        "name": "Bad Game",
        "player_placements": {"Alice": 1, "Eve": 2},
        "team_player_map": {"t1": ["Alice"], "t3": ["Eve"]},
    }
    resp = client.post(f"/api/sessions/{session_id}/games", json=invalid_body)
    assert resp.status_code == 422


def test_remove_game(client, session_id):
    create = client.post(f"/api/sessions/{session_id}/games", json=GAME_BODY)
    game_id = create.json()["id"]
    resp = client.delete(f"/api/sessions/{session_id}/games/{game_id}")
    assert resp.status_code == 204

    session = client.get(f"/api/sessions/{session_id}")
    assert len(session.json()["games"]) == 0


def test_remove_game_not_found(client, session_id):
    resp = client.delete(f"/api/sessions/{session_id}/games/nonexistent")
    assert resp.status_code == 404


# --- Duplicate Player Names (Composite Keys) ---


COMPOSITE_KEY_BODY = {
    "name": "Game Dup",
    "player_placements": {
        "t1::Alex": 1,
        "t1::Sam": 3,
        "t2::Alex": 2,
        "t2::Pat": 4,
    },
    "team_player_map": {"t1": ["Alex", "Sam"], "t2": ["Alex", "Pat"]},
}


def test_add_game_duplicate_names_succeeds(client, session_id):
    """Game creation succeeds when two teams share a player named 'Alex'."""
    resp = client.post(f"/api/sessions/{session_id}/games", json=COMPOSITE_KEY_BODY)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Game Dup"
    # All four composite keys should be present
    assert len(data["player_placements"]) == 4


def test_add_game_duplicate_names_correct_points(client, session_id):
    """Points are calculated correctly for each composite key."""
    resp = client.post(f"/api/sessions/{session_id}/games", json=COMPOSITE_KEY_BODY)
    data = resp.json()
    # 4 players: 1st=4, 2nd=3, 3rd=2, 4th=1
    assert data["player_points"]["t1::Alex"] == 4
    assert data["player_points"]["t2::Alex"] == 3
    assert data["player_points"]["t1::Sam"] == 2
    assert data["player_points"]["t2::Pat"] == 1


def test_add_game_duplicate_names_correct_team_scores(client, session_id):
    """Team aggregations are correct with duplicate player names."""
    resp = client.post(f"/api/sessions/{session_id}/games", json=COMPOSITE_KEY_BODY)
    data = resp.json()
    # t1: Alex(4) + Sam(2) = 6, best pos = 1
    assert data["points"]["t1"] == 6
    assert data["placements"]["t1"] == 1
    # t2: Alex(3) + Pat(1) = 4, best pos = 2
    assert data["points"]["t2"] == 4
    assert data["placements"]["t2"] == 2


def test_add_game_legacy_flat_keys_still_work(client, session_id):
    """Legacy flat keys (no ::) still work for backward compatibility."""
    resp = client.post(f"/api/sessions/{session_id}/games", json=GAME_BODY)
    assert resp.status_code == 201
    data = resp.json()
    assert data["points"]["t1"] == 7
    assert data["points"]["t2"] == 3


# --- Penalties ---


def test_add_penalty(client, session_id):
    body = {"team_id": "t1", "value": -2, "reason": "Late"}
    resp = client.post(f"/api/sessions/{session_id}/penalties", json=body)
    assert resp.status_code == 201
    data = resp.json()
    assert data["team_id"] == "t1"
    assert data["value"] == -2
    assert data["reason"] == "Late"


def test_add_penalty_session_not_found(client):
    resp = client.post(
        "/api/sessions/nonexistent/penalties",
        json={"team_id": "t1", "value": -1},
    )
    assert resp.status_code == 404


def test_add_penalty_team_not_in_session_rejected(client, session_id):
    body = {"team_id": "t3", "value": -2, "reason": "Late"}
    resp = client.post(f"/api/sessions/{session_id}/penalties", json=body)
    assert resp.status_code == 422


def test_remove_penalty(client, session_id):
    create = client.post(
        f"/api/sessions/{session_id}/penalties",
        json={"team_id": "t1", "value": -1},
    )
    penalty_id = create.json()["id"]
    resp = client.delete(f"/api/sessions/{session_id}/penalties/{penalty_id}")
    assert resp.status_code == 204

    session = client.get(f"/api/sessions/{session_id}")
    assert len(session.json()["penalties"]) == 0


def test_remove_penalty_not_found(client, session_id):
    resp = client.delete(f"/api/sessions/{session_id}/penalties/nonexistent")
    assert resp.status_code == 404


# --- Scores ---


def test_session_scores(client, session_id):
    client.post(f"/api/sessions/{session_id}/games", json=GAME_BODY)
    client.post(
        f"/api/sessions/{session_id}/penalties",
        json={"team_id": "t1", "value": -2, "reason": "Late"},
    )

    resp = client.get(f"/api/sessions/{session_id}/scores")
    assert resp.status_code == 200
    scores = resp.json()
    assert len(scores) == 2

    t1 = next(s for s in scores if s["team_id"] == "t1")
    t2 = next(s for s in scores if s["team_id"] == "t2")
    assert t1["game_points"] == 7
    assert t1["penalty_points"] == -2
    assert t1["total"] == 5
    assert t2["game_points"] == 3
    assert t2["total"] == 3


def test_session_scores_not_found(client):
    resp = client.get("/api/sessions/nonexistent/scores")
    assert resp.status_code == 404


def test_session_scores_empty(client, session_id):
    resp = client.get(f"/api/sessions/{session_id}/scores")
    assert resp.status_code == 200
    scores = resp.json()
    assert all(s["total"] == 0 for s in scores)
