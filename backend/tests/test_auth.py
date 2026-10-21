def test_register_and_login(client):
    # Register new user
    register_payload = {
        "name": "Test Architect",
        "email": "architect@pocketledger.dev",
        "password": "Password123!"
    }
    res = client.post("/api/auth/register", json=register_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "architect@pocketledger.dev"

    # Login with same user
    login_payload = {
        "email": "architect@pocketledger.dev",
        "password": "Password123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # Verify /auth/me with Bearer token
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == "architect@pocketledger.dev"
    assert me_data["full_name"] == "Test Architect"

def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={"email": "wrong@example.com", "password": "wrong"})
    assert res.status_code == 401
