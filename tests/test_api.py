import pytest
from starlette.testclient import TestClient
from contextsync.api.server import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ContextSync API"

def test_create_and_recall_memory_api():
    # 1. Create memory
    post_res = client.post("/api/memories", json={
        "content": "ContextSync supports both stdio and REST API transports.",
        "tags": ["transport", "api"]
    })
    assert post_res.status_code == 201
    mem_data = post_res.json()
    assert mem_data["success"] is True
    mem_id = mem_data["memory"]["id"]

    # 2. List memories
    list_res = client.get("/api/memories")
    assert list_res.status_code == 200
    assert len(list_res.json()["memories"]) >= 1

    # 3. Recall memory
    recall_res = client.post("/api/recall", json={
        "query": "What transports does ContextSync support?",
        "limit": 3
    })
    assert recall_res.status_code == 200
    rec_data = recall_res.json()
    assert len(rec_data["memories"]) >= 1

    # 4. Get graph visualizer data
    graph_res = client.get("/api/graph")
    assert graph_res.status_code == 200
    g_data = graph_res.json()
    assert "nodes" in g_data
    assert "links" in g_data

    # 5. Delete memory
    del_res = client.delete(f"/api/memories/{mem_id}")
    assert del_res.status_code == 200
