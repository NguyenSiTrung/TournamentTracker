import pytest


@pytest.fixture()
def existing_team_ids(client):
    first = client.post(
        "/api/teams", json={"name": "Team One", "players": ["Alice"]}
    ).json()["id"]
    second = client.post(
        "/api/teams", json={"name": "Team Two", "players": ["Bob"]}
    ).json()["id"]
    return first, second


def test_list_sessions_empty(client):
    resp = client.get("/api/sessions")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_session(client, existing_team_ids):
    resp = client.post(
        "/api/sessions",
        json={"name": "Round 1", "team_ids": list(existing_team_ids)},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Round 1"
    assert data["team_ids"] == list(existing_team_ids)
    assert data["status"] == "active"
    assert data["games"] == []
    assert data["penalties"] == []


def test_create_session_requires_teams(client):
    resp = client.post("/api/sessions", json={"name": "Round 1", "team_ids": []})
    assert resp.status_code == 422


def test_create_session_unknown_team_rejected(client):
    resp = client.post("/api/sessions", json={"name": "Round 1", "team_ids": ["t1"]})
    assert resp.status_code == 422


def test_create_session_whitespace_name_rejected(client, existing_team_ids):
    resp = client.post(
        "/api/sessions",
        json={"name": "   ", "team_ids": [existing_team_ids[0]]},
    )
    assert resp.status_code == 422


def test_get_session(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "R1", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.get(f"/api/sessions/{sid}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "R1"
    assert "games" in resp.json()
    assert "penalties" in resp.json()


def test_get_session_not_found(client):
    resp = client.get("/api/sessions/nonexistent")
    assert resp.status_code == 404


def test_filter_sessions_by_status(client, existing_team_ids):
    first_team_id = existing_team_ids[0]
    client.post("/api/sessions", json={"name": "Active1", "team_ids": [first_team_id]})
    s2 = client.post("/api/sessions", json={"name": "Done1", "team_ids": [first_team_id]})
    client.put(f"/api/sessions/{s2.json()['id']}", json={"status": "completed"})

    active = client.get("/api/sessions?status=active")
    assert len(active.json()) == 1
    assert active.json()[0]["name"] == "Active1"

    completed = client.get("/api/sessions?status=completed")
    assert len(completed.json()) == 1
    assert completed.json()[0]["name"] == "Done1"

    all_sessions = client.get("/api/sessions")
    assert len(all_sessions.json()) == 2


def test_filter_sessions_invalid_status_rejected(client):
    resp = client.get("/api/sessions?status=banana")
    assert resp.status_code == 422


def test_update_session_name(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "Old", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.put(f"/api/sessions/{sid}", json={"name": "New"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New"
    assert resp.json()["status"] == "active"


def test_update_session_whitespace_name_rejected(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "Old", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.put(f"/api/sessions/{sid}", json={"name": "   "})
    assert resp.status_code == 422


def test_complete_session(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "R1", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.put(f"/api/sessions/{sid}", json={"status": "completed"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


def test_update_session_invalid_status_rejected(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "R1", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.put(f"/api/sessions/{sid}", json={"status": "banana"})
    assert resp.status_code == 422


def test_update_session_not_found(client):
    resp = client.put("/api/sessions/nonexistent", json={"name": "X"})
    assert resp.status_code == 404


def test_delete_session(client, existing_team_ids):
    create = client.post(
        "/api/sessions", json={"name": "R1", "team_ids": [existing_team_ids[0]]}
    )
    sid = create.json()["id"]
    resp = client.delete(f"/api/sessions/{sid}")
    assert resp.status_code == 204
    assert client.get(f"/api/sessions/{sid}").status_code == 404


def test_delete_session_not_found(client):
    resp = client.delete("/api/sessions/nonexistent")
    assert resp.status_code == 404
