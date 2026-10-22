def test_settings_operations(client):
    # 1. Unauthenticated / Guest settings
    res_guest = client.get("/api/settings")
    assert res_guest.status_code == 200
    guest_data = res_guest.json()
    assert guest_data["theme"] in ["dark", "light", "emerald", "ocean", "violet", "sunset"]
    assert guest_data["currency"] in ["INR", "USD", "EUR", "GBP"]

    # 2. Register a new user
    user_email = "settingstest@pocketledger.dev"
    reg_res = client.post("/api/auth/register", json={
        "name": "Settings Tester",
        "email": user_email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Fetch user settings
    res_user_settings = client.get("/api/settings", headers=headers)
    assert res_user_settings.status_code == 200
    user_settings = res_user_settings.json()
    assert user_settings["theme"] == "dark"
    assert user_settings["currency"] == "INR"

    # 4. Update theme to emerald and currency to USD
    res_update = client.put("/api/settings", headers=headers, json={
        "theme": "emerald",
        "currency": "USD"
    })
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["theme"] == "emerald"
    assert updated["currency"] == "USD"

    # 5. Verify persisted settings on subsequent GET
    res_check = client.get("/api/settings", headers=headers)
    assert res_check.status_code == 200
    assert res_check.json()["theme"] == "emerald"
    assert res_check.json()["currency"] == "USD"

    # 6. Verify /auth/me returns updated theme & currency
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    me = res_me.json()
    assert me["theme"] == "emerald"
    assert me["currency"] == "USD"
