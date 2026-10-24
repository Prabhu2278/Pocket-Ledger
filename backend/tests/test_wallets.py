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


def test_wallet_deletion_cascades_transactions(client):
    # 1. Create a wallet
    w_res = client.post("/api/wallets", json={
        "name": "Cascade Test Wallet",
        "wallet_type": "BANK",
        "initial_balance": 1000.0,
        "color": "#10b981"
    })
    assert w_res.status_code == 201
    wallet_id = w_res.json()["id"]

    # 2. Add an expense linked to this wallet
    exp_res = client.post("/api/transactions", json={
        "type": "expense",
        "amount": 150.0,
        "category": "Food",
        "note": "Lunch with team",
        "date": "2026-10-23",
        "wallet_id": wallet_id
    })
    assert exp_res.status_code == 201
    exp_id = exp_res.json()["id"]

    # 3. Add an income linked to this wallet
    inc_res = client.post("/api/transactions", json={
        "type": "income",
        "amount": 500.0,
        "category": "Salary",
        "note": "Freelance work",
        "date": "2026-10-23",
        "wallet_id": wallet_id
    })
    assert inc_res.status_code == 201
    inc_id = inc_res.json()["id"]

    # 4. Verify transactions exist
    tx_list = client.get("/api/transactions").json()
    assert any(t["id"] == exp_id for t in tx_list)
    assert any(t["id"] == inc_id for t in tx_list)

    # 5. Delete the wallet
    del_res = client.delete(f"/api/wallets/{wallet_id}")
    assert del_res.status_code == 200

    # 6. Verify that transactions linked to this wallet are deleted!
    tx_list_after = client.get("/api/transactions").json()
    assert not any(t["id"] == exp_id for t in tx_list_after)
    assert not any(t["id"] == inc_id for t in tx_list_after)
