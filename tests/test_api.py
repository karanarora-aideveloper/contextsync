import pytest
import uuid
from starlette.testclient import TestClient
from contextsync.api.server import app

client = TestClient(app)

def test_auth_and_protected_api_flow():
    # 1. Health check is public
    res = client.get("/health")
    assert res.status_code == 200

    # 2. Accessing protected endpoint without auth fails with 401
    unauth = client.get("/api/memories")
    assert unauth.status_code == 401

    # 3. Sign up a new user with unique email
    test_email = f"testdev_{uuid.uuid4().hex[:6]}@contextsync.dev"
    signup_res = client.post("/api/auth/signup", json={
        "email": test_email,
        "password": "strongpassword123"
    })
    assert signup_res.status_code == 201

    auth_data = signup_res.json()
    assert "token" in auth_data
    token = auth_data["token"]
    api_key = auth_data["user"]["api_key"]

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Fetch user profile via /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == test_email

    # 5. Add memory using Bearer token
    post_res = client.post("/api/memories", json={
        "content": "Use TypeScript strict mode across all frontend files.",
        "tags": ["frontend", "ts"]
    }, headers=headers)
    assert post_res.status_code == 201
    mem_id = post_res.json()["memory"]["id"]

    # 6. Recall memory using X-API-Key (simulating Cursor MCP!)
    cursor_headers = {"X-API-Key": api_key}
    rec_res = client.post("/api/recall", json={
        "query": "What mode do we use for TypeScript?",
        "limit": 3
    }, headers=cursor_headers)
    assert rec_res.status_code == 200
    assert len(rec_res.json()["memories"]) >= 1

    # 7. Delete memory
    del_res = client.delete(f"/api/memories/{mem_id}", headers=headers)
    assert del_res.status_code == 200
