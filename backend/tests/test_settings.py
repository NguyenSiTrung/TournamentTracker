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
