import React, { useState } from 'react'
import { money } from '../utils/formatCurrency'
import { BudgetRing } from '../components/BudgetRing'
import { CATEGORIES } from '../hooks/useExpenses'

function relativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Insights({
  totalSpent,
  budget,
  budgetLeft,
  budgetPercent,
  categoryTotals,
  rankedCategories,
  data,
  setBudget,
}) {
  const [editingBudget, setEditingBudget] = useState(false)
  const [newBudgetVal, setNewBudgetVal] = useState(String(budget))
  const categoryColorMap = Object.fromEntries(CATEGORIES)

  const handleSaveBudget = (e) => {
    e.preventDefault()
    setBudget(Number(newBudgetVal) || 0)
    setEditingBudget(false)
  }

  return (
    <section className="pocket-ledger-insights-view" aria-label="Insights module">
      <div className="pocket-ledger-insights-grid">
        <div className="pocket-ledger-card">
          <h2>Budget</h2>

          <BudgetRing
            totalSpent={totalSpent}
            budget={budget}
            budgetLeft={budgetLeft}
            budgetPercent={budgetPercent}
          />

          <div className="pocket-ledger-budget-editor">
            {editingBudget ? (
              <form onSubmit={handleSaveBudget} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="pocket-ledger-amount-input"
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(e.target.value)}
                  style={{ maxWidth: '160px', padding: '6px 12px' }}
                  autoFocus
                />
                <button type="submit" className="pocket-ledger-primary-button">
                  Save
                </button>
                <button
                  type="button"
                  className="pocket-ledger-ghost-button"
                  onClick={() => setEditingBudget(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="pocket-ledger-ghost-button"
                onClick={() => {
                  setNewBudgetVal(String(budget))
                  setEditingBudget(true)
                }}
              >
                ✎ Adjust monthly budget
              </button>
            )}
          </div>
        </div>

        <div className="pocket-ledger-card">
          <h2>Categories</h2>

          <div className="pocket-ledger-category-legend">
            {rankedCategories.length === 0 ? (
              <p style={{ color: 'var(--pocket-muted)', fontSize: '13px' }}>
                No category data for this month.
              </p>
            ) : (
              rankedCategories.map((cat) => {
                const amt = categoryTotals[cat] || 0
                const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0
                const color = categoryColorMap[cat] || '#64748b'

                return (
                  <div key={cat} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13.5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="pocket-ledger-category-dot"
                          style={{ background: color }}
                        />
                        <b>{cat}</b>
                      </span>
                      <span>
                        {money(amt)} <small style={{ color: 'var(--pocket-muted)' }}>({pct}%)</small>
                      </span>
                    </div>

                    <div className="pocket-ledger-category-bar">
                      <i style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="pocket-ledger-card">
          <h2>Recent activity</h2>

          <ul className="pocket-ledger-activity-list">
            {!data.log || data.log.length === 0 ? (
              <li style={{ color: 'var(--pocket-muted)', fontSize: '13px' }}>
                No recent activity logged.
              </li>
            ) : (
              data.log.slice(0, 10).map((item, idx) => (
                <li key={idx}>
                  <span>{item.txt}</span>
                  <time>{relativeTime(item.t)}</time>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Insights
