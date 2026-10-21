import React, { useState, useEffect } from 'react'
import { money } from '../utils/formatCurrency'
import { BudgetRing } from '../components/BudgetRing'
import { getCategoryColor } from '../constants/categories'

function formatRelativeTime(timestamp) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h ago`
  return `${Math.floor(diffSec / 86400)} d ago`
}

export function Insights({
  totalSpent = 0,
  budget = 20000,
  budgetLeft = 0,
  budgetPercent = 0,
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  daysLeft = 'Closed',
  isCurrentMonth = true,
  categoryTotals = {},
  rankedCategories = [],
  last7Days = [],
  activityLogs = [],
  onUpdateBudget,
  onSelectCategoryFilter,
}) {
  const [budgetVal, setBudgetVal] = useState(budget)

  useEffect(() => {
    setBudgetVal(budget)
  }, [budget])

  const handleBudgetChange = (e) => {
    const val = parseFloat(e.target.value)
    const newBudget = val >= 0 ? val : 0
    setBudgetVal(newBudget)
    if (onUpdateBudget) {
      onUpdateBudget(newBudget)
    }
  }

  // Calculate hint text matching prototype
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
  const todayDate = new Date().getDate()
  const dl = Math.max(daysInMonth - todayDate, 1)

  let hintText = ''
  if (!isCurrentMonth) {
    hintText = `This month is closed. You spent ${money(totalSpent)}.`
  } else if (budgetLeft > 0) {
    hintText = `You can spend about ${money(budgetLeft / dl)} a day and stay on budget.`
  } else {
    hintText = `You are ${money(Math.abs(budgetLeft))} over budget. A no-spend day will help.`
  }

  // Max value for last 7 days chart
  const maxDayAmount = Math.max(1, ...last7Days.map((d) => d.amount || 0))

  return (
    <section className="view on" id="v2" aria-label="Insights module">
      <div className="grid2">
        {/* Card 1: Budget Ring */}
        <div className="card">
          <h2>Budget</h2>
          <BudgetRing
            totalSpent={totalSpent}
            budget={budget}
            budgetLeft={budgetLeft}
            budgetPercent={budgetPercent}
            daysLeft={daysLeft}
          />
          <div className="hint" id="hint">
            {hintText}
          </div>
          <div className="bud">
            <label htmlFor="budget">Monthly budget</label>
            <input
              id="budget"
              type="number"
              inputMode="decimal"
              min="0"
              value={budgetVal}
              onChange={handleBudgetChange}
            />
          </div>
        </div>

        {/* Card 2: Last 7 days */}
        <div className="card">
          <h2>
            Last 7 days <small>hover a bar for the amount</small>
          </h2>
          <div className="week" id="week">
            {last7Days.map((d) => {
              const heightPx = (d.amount / maxDayAmount) * 110
              return (
                <div
                  key={d.date}
                  className={d.is_today ? 'today' : ''}
                  title={money(d.amount)}
                >
                  <span>{money(d.amount)}</span>
                  <i
                    style={{ height: `${Math.max(heightPx, 4)}px` }}
                    aria-hidden="true"
                  ></i>
                  <span>{d.day_name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 3: Where your money went */}
        <div className="card">
          <h2>
            Where your money went <small>click to filter</small>
          </h2>
          <div id="break">
            {rankedCategories.length > 0 ? (
              <>
                <div className="bar" role="img" aria-label="Spending by category">
                  {rankedCategories.map((cat) => {
                    const amt = categoryTotals[cat] || 0
                    const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0
                    return (
                      <i
                        key={cat}
                        style={{
                          width: `${pct}%`,
                          background: getCategoryColor(cat),
                        }}
                      ></i>
                    )
                  })}
                </div>
                {rankedCategories.map((cat) => {
                  const amt = categoryTotals[cat] || 0
                  const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0
                  return (
                    <button
                      key={cat}
                      type="button"
                      className="lg"
                      onClick={() => onSelectCategoryFilter(cat)}
                    >
                      <i style={{ background: getCategoryColor(cat) }}></i>
                      {cat}
                      <em>
                        {money(amt)} · {pct}%
                      </em>
                    </button>
                  )
                })}
              </>
            ) : (
              <div className="empty">
                <b>No spending yet</b>
                Add an expense to see your breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Recent activity */}
        <div className="card">
          <h2>Recent activity</h2>
          <ul className="feed" id="feed">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 7).map((log, idx) => (
                <li key={idx}>
                  {log.txt}
                  <span>{formatRelativeTime(log.t)}</span>
                </li>
              ))
            ) : (
              <li style={{ color: 'var(--mute)' }}>No recent activity.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Insights
