def test_analytics_and_insights_summary(client):
    month_key = "2026-10"

    # Add expense for this month
    client.post("/api/transactions", json={
        "type": "expense",
        "amount": 1200.0,
        "category": "Shopping",
        "note": "Books",
        "date": "2026-10-15"
    })

    # Fetch insights summary
    res = client.get(f"/api/insights?month_key={month_key}")
    assert res.status_code == 200
    data = res.json()
    assert "total_spent" in data
    assert "remaining_budget" in data
    assert "category_breakdown" in data
    assert "last_7_days" in data
