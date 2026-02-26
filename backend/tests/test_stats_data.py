import pytest


@pytest.fixture()
def populated_db(client):
    """Create teams, a completed session with games and penalties."""
    import_resp = client.post(
        "/api/import",
        json={
            "teams": [
                {
                    "id": "t1",
                    "name": "Alpha",
                    "players": ["Alice", "Bob"],
                    "color": "#e74c3c",
                    "tag": "ALP",
                },
                {
                    "id": "t2",
                    "name": "Beta",
                    "players": ["Carol", "Dave"],
                    "color": "#3498db",
                    "tag": "BET",
                },
            ]
        },
    )
    assert import_resp.status_code == 201

    s = client.post("/api/sessions", json={"name": "R1", "team_ids": ["t1", "t2"]})
    sid = s.json()["id"]

    client.post(f"/api/sessions/{sid}/games", json={
        "name": "G1",
        "player_placements": {"Alice": 1, "Bob": 2, "Carol": 3, "Dave": 4},
        "team_player_map": {"t1": ["Alice", "Bob"], "t2": ["Carol", "Dave"]},
    })
    client.post(f"/api/sessions/{sid}/penalties", json={
        "team_id": "t1", "value": -1, "reason": "Late",
    })
    client.put(f"/api/sessions/{sid}", json={"status": "completed"})
    return sid


# --- Leaderboard ---


def test_leaderboard_empty(client):
    resp = client.get("/api/stats/leaderboard")
    assert resp.status_code == 200
    assert resp.json() == []


def test_leaderboard_with_data(client, populated_db):
    resp = client.get("/api/stats/leaderboard")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    # t1: Alice=4+Bob=3 - 1 penalty = 6; t2: Carol=2+Dave=1 = 3
    t1 = next(e for e in data if e["team_id"] == "t1")
    t2 = next(e for e in data if e["team_id"] == "t2")
    assert t1["total_points"] == 6
    assert t1["wins"] == 1
    assert t1["sessions"] == 1
    assert t2["total_points"] == 3
    assert t2["wins"] == 0


def test_leaderboard_ignores_active_sessions(client):
    client.post("/api/import", json={"teams": [{"id": "t1", "name": "Alpha", "players": ["Alice"]}]})
    s = client.post("/api/sessions", json={"name": "Active", "team_ids": ["t1"]})
    sid = s.json()["id"]
    client.post(f"/api/sessions/{sid}/games", json={
        "name": "G1",
        "player_placements": {"Alice": 1},
        "team_player_map": {"t1": ["Alice"]},
    })
    # Not completed — should not appear in leaderboard
    resp = client.get("/api/stats/leaderboard")
    assert resp.json() == []


# --- Export ---


def test_export_empty(client):
    resp = client.get("/api/export")
    assert resp.status_code == 200
    data = resp.json()
    assert data["teams"] == []
    assert data["sessions"] == []
    assert data["settings"]["league_name"] == "Pro League"


def test_export_with_data(client, populated_db):
    resp = client.get("/api/export")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["teams"]) == 2
    assert all("color" in t and "tag" in t for t in data["teams"])
    assert len(data["sessions"]) == 1
    assert len(data["sessions"][0]["games"]) == 1
    assert len(data["sessions"][0]["penalties"]) == 1
    assert "settings" in data


# --- Import ---


def test_import_data(client):
    payload = {
        "teams": [
            {"id": "imp1", "name": "Imported1", "players": ["X"]},
            {"id": "imp2", "name": "Imported2", "players": ["Y"]},
        ],
        "sessions": [
            {
                "id": "s1",
                "name": "Imported Session",
                "teamIds": ["imp1", "imp2"],
                "status": "completed",
                "games": [
                    {
                        "id": "g1",
                        "name": "G1",
                        "playerPlacements": {"X": 1, "Y": 2},
                        "playerPoints": {"X": 4, "Y": 1},
                        "teamPlayerMap": {"imp1": ["X"], "imp2": ["Y"]},
                        "points": {"imp1": 4, "imp2": 1},
                        "placements": {"imp1": 1, "imp2": 2},
                    }
                ],
                "penalties": [],
            }
        ],
    }
    resp = client.post("/api/import", json=payload)
    assert resp.status_code == 201
    assert resp.json()["imported"]["teams"] == 2
    assert resp.json()["imported"]["sessions"] == 1

    # Verify imported data
    teams = client.get("/api/teams").json()
    assert len(teams) == 2

    session = client.get("/api/sessions/s1").json()
    assert session["name"] == "Imported Session"
    assert len(session["games"]) == 1


def test_import_invalid_date_returns_422(client):
    payload = {
        "teams": [{"id": "imp1", "name": "Imported1", "players": ["X"]}],
        "sessions": [
            {
                "id": "s1",
                "name": "Imported Session",
                "date": "not-a-date",
                "teamIds": ["imp1"],
                "status": "active",
                "games": [],
                "penalties": [],
            }
        ],
    }
    resp = client.post("/api/import", json=payload)
    assert resp.status_code == 422


def test_import_roundtrip_preserves_team_identity_and_settings(client, populated_db):
    client.put(
        "/api/settings",
        json={
            "league_name": "Roundtrip League",
            "season": "Season 77",
            "scoring": {"first": 9, "second": 6, "third": 3, "fourth": 1},
        },
    )
    exported = client.get("/api/export").json()

    # Import into fresh state
    client.request(
        "DELETE",
        "/api/data/reset",
        json={"teams": True, "sessions": True, "settings": True},
    )
    resp = client.post("/api/import", json=exported)
    assert resp.status_code == 201

    teams = client.get("/api/teams").json()
    assert {team["id"] for team in teams} == {"t1", "t2"}
    assert next(team for team in teams if team["id"] == "t1")["color"] == "#e74c3c"
    assert next(team for team in teams if team["id"] == "t1")["tag"] == "ALP"

    settings = client.get("/api/settings").json()
    assert settings["league_name"] == "Roundtrip League"
    assert settings["season"] == "Season 77"
    assert settings["scoring"]["first"] == 9


# --- Reset ---


def test_reset_sessions(client, populated_db):
    """DELETE /api/data/reset with sessions=true clears sessions, games, penalties."""
    resp = client.request("DELETE", "/api/data/reset", json={"sessions": True})
    assert resp.status_code == 200
    assert resp.json()["reset"]["sessions"] is True

    # Verify sessions are gone
    sessions = client.get("/api/sessions").json()
    assert len(sessions) == 0

    # Teams should still exist
    teams = client.get("/api/teams").json()
    assert len(teams) == 2


def test_reset_teams(client, populated_db):
    """DELETE /api/data/reset with teams=true clears teams only."""
    resp = client.request("DELETE", "/api/data/reset", json={"teams": True})
    assert resp.status_code == 200
    assert resp.json()["reset"]["teams"] is True

    teams = client.get("/api/teams").json()
    assert len(teams) == 0


def test_reset_settings(client):
    """DELETE /api/data/reset with settings=true clears settings."""
    # First update settings
    client.put("/api/settings", json={"league_name": "Test League"})

    resp = client.request("DELETE", "/api/data/reset", json={"settings": True})
    assert resp.status_code == 200
    assert resp.json()["reset"]["settings"] is True

    # Settings should now return defaults (empty table → schema defaults)
    settings = client.get("/api/settings").json()
    assert settings["league_name"] == "Pro League"


def test_reset_multiple_categories(client, populated_db):
    """DELETE /api/data/reset with multiple categories clears all selected."""
    resp = client.request("DELETE", "/api/data/reset", json={
        "teams": True, "sessions": True,
    })
    assert resp.status_code == 200
    assert resp.json()["reset"]["teams"] is True
    assert resp.json()["reset"]["sessions"] is True

    teams = client.get("/api/teams").json()
    sessions = client.get("/api/sessions").json()
    assert len(teams) == 0
    assert len(sessions) == 0


def test_reset_no_categories_returns_422(client):
    """DELETE /api/data/reset with no categories returns 422."""
    resp = client.request("DELETE", "/api/data/reset", json={})
    assert resp.status_code == 422
