"""Tests for Settings API endpoints and ORM model."""


def test_get_settings_returns_defaults(client):
    """GET /api/settings returns default settings when no updates have been made."""
    resp = client.get("/api/settings")
    assert resp.status_code == 200
    data = resp.json()
    assert data["league_name"] == "Pro League"
    assert data["season"] == "Season 4"
    assert data["description"] == ""
    assert data["scoring"]["first"] == 4
    assert data["scoring"]["second"] == 3
    assert data["scoring"]["third"] == 2
    assert data["scoring"]["fourth"] == 1
    assert data["scoring_2p"]["first"] == 4
    assert data["scoring_2p"]["second"] == 1


def test_update_league_info(client):
    """PUT /api/settings updates league name, season, and description."""
    resp = client.put("/api/settings", json={
        "league_name": "Champions League",
        "season": "Season 10",
        "description": "The best league ever",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["league_name"] == "Champions League"
    assert data["season"] == "Season 10"
    assert data["description"] == "The best league ever"
    # Scoring should remain default
    assert data["scoring"]["first"] == 4


def test_update_scoring_config(client):
    """PUT /api/settings updates scoring configuration."""
    resp = client.put("/api/settings", json={
        "scoring": {"first": 10, "second": 7, "third": 5, "fourth": 2},
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["scoring"]["first"] == 10
    assert data["scoring"]["second"] == 7
    assert data["scoring"]["third"] == 5
    assert data["scoring"]["fourth"] == 2


def test_update_scoring_2p_config(client):
    """PUT /api/settings updates 2-player scoring configuration."""
    resp = client.put("/api/settings", json={
        "scoring_2p": {"first": 6, "second": 2},
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["scoring_2p"]["first"] == 6
    assert data["scoring_2p"]["second"] == 2


def test_partial_update_preserves_other_fields(client):
    """PUT /api/settings with partial data does not overwrite other fields."""
    # First set league name
    client.put("/api/settings", json={"league_name": "My League"})
    # Then update only season
    resp = client.put("/api/settings", json={"season": "Season 99"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["league_name"] == "My League"
    assert data["season"] == "Season 99"


def test_settings_persistence(client):
    """Settings persist across requests."""
    client.put("/api/settings", json={
        "league_name": "Persistent League",
        "scoring": {"first": 20, "second": 15, "third": 10, "fourth": 5},
    })
    resp = client.get("/api/settings")
    data = resp.json()
    assert data["league_name"] == "Persistent League"
    assert data["scoring"]["first"] == 20


def test_empty_update_changes_nothing(client):
    """PUT /api/settings with empty body changes nothing."""
    before = client.get("/api/settings").json()
    resp = client.put("/api/settings", json={})
    assert resp.status_code == 200
    after = resp.json()
    assert before == after


def test_custom_scoring_applied_to_game(client):
    """Custom scoring config from settings is used when adding a game."""
    # Set custom scoring: 1st=10, 2nd=7, 3rd=5, 4th=2
    client.put("/api/settings", json={
        "scoring": {"first": 10, "second": 7, "third": 5, "fourth": 2},
    })

    # Create teams and a session
    client.post("/api/teams", json={"name": "Team A", "players": ["P1"]})
    client.post("/api/teams", json={"name": "Team B", "players": ["P2"]})
    s = client.post("/api/sessions", json={"name": "Test", "team_ids": ["tA", "tB"]})
    sid = s.json()["id"]

    # Add a game with 4 players
    resp = client.post(f"/api/sessions/{sid}/games", json={
        "name": "G1",
        "player_placements": {"P1": 1, "P2": 2, "P3": 3, "P4": 4},
        "team_player_map": {"tA": ["P1", "P3"], "tB": ["P2", "P4"]},
    })
    assert resp.status_code == 201
    data = resp.json()
    # P1 (1st) should get 10 points, P2 (2nd) should get 7
    assert data["player_points"]["P1"] == 10
    assert data["player_points"]["P2"] == 7
    assert data["player_points"]["P3"] == 5
    assert data["player_points"]["P4"] == 2


def test_custom_scoring_2p_applied(client):
    """Custom 2-player scoring config is used when adding a 2-player game."""
    client.put("/api/settings", json={
        "scoring_2p": {"first": 6, "second": 2},
    })

    s = client.post("/api/sessions", json={"name": "Test2P", "team_ids": ["t1", "t2"]})
    sid = s.json()["id"]

    resp = client.post(f"/api/sessions/{sid}/games", json={
        "name": "G1",
        "player_placements": {"Alice": 1, "Bob": 2},
        "team_player_map": {"t1": ["Alice"], "t2": ["Bob"]},
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["player_points"]["Alice"] == 6
    assert data["player_points"]["Bob"] == 2
