def test_wallet_crud(client):
    # 1. Create a wallet
    wallet_payload = {
        "name": "Main Checking",
        "wallet_type": "BANK",
        "initial_balance": 5000.0,
        "color": "#3b82f6"
    }
    res = client.post("/api/wallets", json=wallet_payload)
    assert res.status_code == 201
    wallet = res.json()
    wallet_id = wallet["id"]
    assert wallet["name"] == "Main Checking"
    assert wallet["current_balance"] == 5000.0

    # 2. Get all wallets
    res_list = client.get("/api/wallets")
    assert res_list.status_code == 200
    wallets = res_list.json()
    assert any(w["id"] == wallet_id for w in wallets)

    # 3. Update wallet
    update_payload = {"name": "Primary Checking", "initial_balance": 6000.0}
    res_update = client.put(f"/api/wallets/{wallet_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Primary Checking"

    # 4. Delete wallet
    res_delete = client.delete(f"/api/wallets/{wallet_id}")
    assert res_delete.status_code == 200
