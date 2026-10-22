import pytest

def test_currency_endpoints(client):
    # 1. Unauthenticated GET /api/v1/settings/currency
    res = client.get("/api/v1/settings/currency")
    assert res.status_code == 200
    assert res.json()["currency_code"] == "INR"

    # 2. Register a new user
    user_email = "currency_tester@pocketledger.dev"
    reg = client.post("/api/auth/register", json={
        "name": "Currency Tester",
        "email": user_email,
        "password": "Password123!"
    })
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. New user defaults to INR
    res = client.get("/api/v1/settings/currency", headers=headers)
    assert res.status_code == 200
    assert res.json()["currency_code"] == "INR"

    # 4. Update to USD
    res = client.put("/api/v1/settings/currency", headers=headers, json={"currency_code": "USD"})
    assert res.status_code == 200
    assert res.json()["currency_code"] == "USD"

    # Verify persistence
    res = client.get("/api/v1/settings/currency", headers=headers)
    assert res.status_code == 200
    assert res.json()["currency_code"] == "USD"

    # 5. Update to EUR
    res = client.put("/api/v1/settings/currency", headers=headers, json={"currency_code": "EUR"})
    assert res.status_code == 200
    assert res.json()["currency_code"] == "EUR"

    # 6. Update to GBP
    res = client.put("/api/v1/settings/currency", headers=headers, json={"currency_code": "GBP"})
    assert res.status_code == 200
    assert res.json()["currency_code"] == "GBP"

    # 7. Restore INR
    res = client.put("/api/v1/settings/currency", headers=headers, json={"currency_code": "INR"})
    assert res.status_code == 200
    assert res.json()["currency_code"] == "INR"

    # 8. Invalid currency code rejection
    res = client.put("/api/v1/settings/currency", headers=headers, json={"currency_code": "XYZ"})
    assert res.status_code in [400, 422]

    # 9. Verify compatibility with legacy /api/settings endpoint
    res = client.get("/api/settings", headers=headers)
    assert res.status_code == 200
    assert res.json()["currency"] == "INR"


def test_category_endpoints_and_lifecycle(client):
    # 1. Register User A
    user_a = client.post("/api/auth/register", json={
        "name": "User Alpha",
        "email": "user_alpha@pocketledger.dev",
        "password": "Password123!"
    }).json()
    headers_a = {"Authorization": f"Bearer {user_a['access_token']}"}

    # 2. Register User B
    user_b = client.post("/api/auth/register", json={
        "name": "User Beta",
        "email": "user_beta@pocketledger.dev",
        "password": "Password123!"
    }).json()
    headers_b = {"Authorization": f"Bearer {user_b['access_token']}"}

    # 3. GET /api/v1/categories - Defaults are present
    res = client.get("/api/v1/categories", headers=headers_a)
    assert res.status_code == 200
    all_cats = res.json()
    assert len(all_cats) >= 17
    # Verify default badge
    default_food = next((c for c in all_cats if c["name"] == "Food" and c["type"] == "expense"), None)
    assert default_food is not None
    assert default_food["is_default"] is True
    assert default_food["user_id"] is None

    # Filter by type: income
    res_inc = client.get("/api/v1/categories?type=income", headers=headers_a)
    assert res_inc.status_code == 200
    assert all(c["type"] == "income" for c in res_inc.json())
    assert any(c["name"] == "Salary" for c in res_inc.json())

    # 4. User A creates custom category "Gym"
    res_create = client.post("/api/v1/categories", headers=headers_a, json={
        "name": "Gym",
        "type": "expense",
        "icon": "dumbbell",
        "color": "#10b981"
    })
    assert res_create.status_code == 201
    gym_cat = res_create.json()
    assert gym_cat["name"] == "Gym"
    assert gym_cat["type"] == "expense"
    assert gym_cat["is_default"] is False
    assert gym_cat["user_id"] == user_a["user"]["id"]

    # 5. Duplicate against system default is rejected (e.g. "Food" or "food")
    res_dup_default = client.post("/api/v1/categories", headers=headers_a, json={
        "name": "food",
        "type": "expense"
    })
    assert res_dup_default.status_code == 400

    # 6. Duplicate against user's own category is rejected (case-insensitive "gym")
    res_dup_user = client.post("/api/v1/categories", headers=headers_a, json={
        "name": "gym",
        "type": "expense"
    })
    assert res_dup_user.status_code == 400

    # 7. Isolation check: User B does NOT see User A's custom "Gym" category
    res_b_cats = client.get("/api/v1/categories", headers=headers_b)
    assert res_b_cats.status_code == 200
    assert not any(c["name"] == "Gym" for c in res_b_cats.json())

    # 8. User B cannot modify or delete User A's custom category
    res_b_mod = client.put(f"/api/v1/categories/{gym_cat['id']}", headers=headers_b, json={"name": "Gym Renamed"})
    assert res_b_mod.status_code in [403, 404]

    res_b_del = client.delete(f"/api/v1/categories/{gym_cat['id']}", headers=headers_b)
    assert res_b_del.status_code in [403, 404]

    # 9. User A cannot delete system default category
    res_del_default = client.delete(f"/api/v1/categories/{default_food['id']}", headers=headers_a)
    assert res_del_default.status_code == 403

    # 10. User A updates their custom category
    res_update = client.put(f"/api/v1/categories/{gym_cat['id']}", headers=headers_a, json={
        "name": "Fitness & Gym",
        "color": "#06b6d4"
    })
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Fitness & Gym"
    assert res_update.json()["color"] == "#06b6d4"

    # 11. Transaction Reference & Safe Deactivation:
    # User A creates a transaction referencing "Fitness & Gym"
    tx_res = client.post("/api/transactions", headers=headers_a, json={
        "amount": 1500,
        "category": "Fitness & Gym",
        "note": "Monthly Membership",
        "date": "2026-10-22",
        "type": "EXPENSE"
    })
    assert tx_res.status_code in [200, 201]

    # Now attempt to delete "Fitness & Gym" category -> should be safely deactivated
    del_res = client.delete(f"/api/v1/categories/{gym_cat['id']}", headers=headers_a)
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["status"] == "deactivated"
    assert del_data["is_active"] is False

    # Historical transaction still exists and intact
    tx_check = client.get("/api/transactions", headers=headers_a)
    assert tx_check.status_code == 200
    user_txs = tx_check.json()
    found_tx = next((t for t in user_txs if t.get("category") == "Fitness & Gym" or t.get("cat") == "Fitness & Gym"), None)
    assert found_tx is not None
