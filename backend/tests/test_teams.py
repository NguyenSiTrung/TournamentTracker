def test_list_teams_empty(client):
    resp = client.get("/api/teams")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_team(client):
    resp = client.post("/api/teams", json={"name": "Alpha", "players": ["Alice", "Bob"]})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Alpha"
    assert data["players"] == ["Alice", "Bob"]
    assert "id" in data
    assert "created_at" in data


def test_create_team_strips_whitespace(client):
    resp = client.post("/api/teams", json={"name": "  Beta  ", "players": [" Carol ", "", " Dave "]})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Beta"
    assert data["players"] == ["Carol", "Dave"]


def test_create_team_empty_name_rejected(client):
    resp = client.post("/api/teams", json={"name": "", "players": []})
    assert resp.status_code == 422


def test_get_team(client):
    create = client.post("/api/teams", json={"name": "Gamma", "players": ["Eve"]})
    team_id = create.json()["id"]
    resp = client.get(f"/api/teams/{team_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Gamma"


def test_get_team_not_found(client):
    resp = client.get("/api/teams/nonexistent")
    assert resp.status_code == 404


def test_update_team(client):
    create = client.post("/api/teams", json={"name": "Delta", "players": ["Frank"]})
    team_id = create.json()["id"]
    resp = client.put(f"/api/teams/{team_id}", json={"name": "Delta v2", "players": ["Frank", "Grace"]})
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Delta v2"
    assert data["players"] == ["Frank", "Grace"]


def test_update_team_not_found(client):
    resp = client.put("/api/teams/nonexistent", json={"name": "X", "players": []})
    assert resp.status_code == 404


def test_delete_team(client):
    create = client.post("/api/teams", json={"name": "Epsilon", "players": []})
    team_id = create.json()["id"]
    resp = client.delete(f"/api/teams/{team_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/teams/{team_id}")
    assert resp.status_code == 404


def test_delete_team_not_found(client):
    resp = client.delete("/api/teams/nonexistent")
    assert resp.status_code == 404


def test_list_teams_returns_created(client):
    client.post("/api/teams", json={"name": "T1", "players": []})
    client.post("/api/teams", json={"name": "T2", "players": []})
    resp = client.get("/api/teams")
    assert resp.status_code == 200
    assert len(resp.json()) == 2
