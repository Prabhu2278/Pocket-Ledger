def test_budget_operations(client):
    month_key = "2026-10"

    # Get or create default budget
    res = client.get(f"/api/insights/budget?month_key={month_key}")
    assert res.status_code == 200
    data = res.json()
    assert data["month_key"] == month_key

    # Update budget target
    update_res = client.post("/api/insights/budget", json={
        "month_key": month_key,
        "target_amount": 35000.0
    })
    assert update_res.status_code == 200
    assert update_res.json()["target_amount"] == 35000.0
