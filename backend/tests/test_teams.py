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


def test_create_team_whitespace_name_rejected(client):
    resp = client.post("/api/teams", json={"name": "   ", "players": []})
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


# --- Color & Tag tests ---


def test_create_team_with_color_and_tag(client):
    resp = client.post(
        "/api/teams",
        json={"name": "Alpha", "players": ["Alice"], "color": "#e74c3c", "tag": "ALP"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["color"] == "#e74c3c"
    assert data["tag"] == "ALP"


def test_create_team_without_color_tag_defaults_none(client):
    resp = client.post("/api/teams", json={"name": "Beta", "players": []})
    assert resp.status_code == 201
    data = resp.json()
    assert data["color"] is None
    assert data["tag"] is None


def test_create_team_response_includes_color_tag(client):
    resp = client.post("/api/teams", json={"name": "Gamma", "players": []})
    data = resp.json()
    assert "color" in data
    assert "tag" in data


def test_update_team_with_color_and_tag(client):
    create = client.post("/api/teams", json={"name": "Delta", "players": []})
    team_id = create.json()["id"]
    resp = client.put(
        f"/api/teams/{team_id}",
        json={"name": "Delta", "players": [], "color": "#3498db", "tag": "DLT"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["color"] == "#3498db"
    assert data["tag"] == "DLT"


def test_update_team_color_tag_persists(client):
    create = client.post(
        "/api/teams",
        json={"name": "Eps", "players": [], "color": "#2ecc71", "tag": "EPS"},
    )
    team_id = create.json()["id"]
    # Update only name, keep same color/tag
    resp = client.put(
        f"/api/teams/{team_id}",
        json={"name": "Epsilon", "players": [], "color": "#2ecc71", "tag": "EPS"},
    )
    assert resp.status_code == 200
    # GET should return persisted values
    get_resp = client.get(f"/api/teams/{team_id}")
    data = get_resp.json()
    assert data["color"] == "#2ecc71"
    assert data["tag"] == "EPS"


def test_tag_max_length_truncated(client):
    resp = client.post(
        "/api/teams",
        json={"name": "Zeta", "players": [], "tag": "TOOLONG"},
    )
    # Pydantic should reject tags longer than 4 chars
    assert resp.status_code == 422


def test_get_team_returns_color_tag(client):
    create = client.post(
        "/api/teams",
        json={"name": "Kappa", "players": [], "color": "#f39c12", "tag": "KAP"},
    )
    team_id = create.json()["id"]
    resp = client.get(f"/api/teams/{team_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["color"] == "#f39c12"
    assert data["tag"] == "KAP"


def test_list_teams_returns_color_tag(client):
    client.post(
        "/api/teams",
        json={"name": "T1", "players": [], "color": "#e74c3c", "tag": "ONE"},
    )
    client.post(
        "/api/teams",
        json={"name": "T2", "players": [], "color": "#3498db", "tag": "TWO"},
    )
    resp = client.get("/api/teams")
    assert resp.status_code == 200
    teams = resp.json()
    assert all("color" in t and "tag" in t for t in teams)
