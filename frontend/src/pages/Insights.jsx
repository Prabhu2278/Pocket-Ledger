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
  totalIncome = 0,
  netCashFlow = 0,
  budget = 20000,
  budgetLeft = 0,
  budgetPercent = 0,
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  daysLeft = 'Closed',
  isCurrentMonth = true,
  categoryTotals = {},
  rankedCategories = [],
  incomeCategoryTotals = {},
  rankedIncomeCategories = [],
  last7Days = [],
  activityLogs = [],
  wallets = [],
  currency = 'INR',
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

  // Calculate hint text
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
  const todayDate = new Date().getDate()
  const dl = Math.max(daysInMonth - todayDate, 1)

  let hintText
  if (!isCurrentMonth) {
    hintText = `This month is closed. Total spent: ${money(totalSpent, currency)}.`
  } else if (budgetLeft > 0) {
    hintText = `You can spend about ${money(budgetLeft / dl, currency)} a day and stay on budget.`
  } else {
    hintText = `You are ${money(Math.abs(budgetLeft), currency)} over budget. A no-spend day will help.`
  }

  // Max value for last 7 days chart
  const maxDayAmount = Math.max(1, ...last7Days.map((d) => d.amount || 0))

  return (
    <section className="view on" id="v-insights" aria-label="Dashboard module">
      {/* Cash Flow Summary Cards */}
      <div className="kpis">
        <div className="card kpi kpi-income">
          <span>Total Income</span>
          <b className="pos">+{money(totalIncome, currency)}</b>
        </div>
        <div className="card kpi kpi-expense">
          <span>Total Expenses</span>
          <b className="neg">-{money(totalSpent, currency)}</b>
        </div>
        <div className={`card kpi ${netCashFlow >= 0 ? 'kpi-pos' : 'kpi-neg'}`}>
          <span>Net Cash Flow</span>
          <b className={netCashFlow >= 0 ? 'pos' : 'neg'}>
            {netCashFlow >= 0 ? '+' : '-'}
            {money(Math.abs(netCashFlow), currency)}
          </b>
        </div>
        <div className="card kpi kpi-primary">
          <span>Savings Rate</span>
          <b>
            {totalIncome > 0
              ? `${Math.max(0, Math.round((netCashFlow / totalIncome) * 100))}%`
              : '0%'}
          </b>
        </div>
      </div>

      {/* Wallet Accounts Quick Bar */}
      {wallets && wallets.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pl-text-muted)' }}>
              Accounts & Wallets
            </span>
            <a href="#/wallets" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--pl-color-primary)', textDecoration: 'none' }}>
              Manage Wallets →
            </a>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {wallets.map((w) => {
              const b = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
              return (
                <div
                  key={w.id}
                  style={{
                    background: 'var(--pl-bg-muted)',
                    border: '1px solid var(--pl-border-default)',
                    borderLeft: `3.5px solid ${w.color || '#10b981'}`,
                    borderRadius: 'var(--pl-radius-md)',
                    padding: '9px 14px',
                    minWidth: '155px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--pl-text-muted)', whiteSpace: 'nowrap' }}>
                    {w.name}
                  </span>
                  <b style={{ fontSize: '15px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: b >= 0 ? 'var(--pl-color-success)' : 'var(--pl-color-danger)' }}>
                    {money(b, currency)}
                  </b>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
            currency={currency}
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

        {/* Card 2: Last 7 days spending */}
        <div className="card">
          <h2>
            Last 7 days expenses <small>hover a bar for the amount</small>
          </h2>
          <div className="week" id="week">
            {last7Days.map((d) => {
              const heightPx = (d.amount / maxDayAmount) * 110
              return (
                <div
                  key={d.date}
                  className={d.is_today ? 'today' : ''}
                  title={money(d.amount, currency)}
                >
                  <span>{money(d.amount, currency)}</span>
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

        {/* Card 3: Where your money went (Expenses) */}
        <div className="card">
          <h2>
            Where your money went <small>click to filter expenses</small>
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
                        {money(amt, currency)} · {pct}%
                      </em>
                    </button>
                  )
                })}
              </>
            ) : (
              <div className="empty">
                <b>No expenses yet</b>
                Add an expense to see your spending breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Where your money came from (Income) */}
        <div className="card">
          <h2>
            Income sources <small>monthly revenue breakdown</small>
          </h2>
          <div id="inc-break">
            {rankedIncomeCategories.length > 0 ? (
              <>
                <div className="bar" role="img" aria-label="Income by category">
                  {rankedIncomeCategories.map((cat) => {
                    const amt = incomeCategoryTotals[cat] || 0
                    const pct = totalIncome > 0 ? (amt / totalIncome) * 100 : 0
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
                {rankedIncomeCategories.map((cat) => {
                  const amt = incomeCategoryTotals[cat] || 0
                  const pct = totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0
                  return (
                    <div key={cat} className="lg">
                      <i style={{ background: getCategoryColor(cat) }}></i>
                      {cat}
                      <em>
                        +{money(amt, currency)} · {pct}%
                      </em>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="empty">
                <b>No income recorded yet</b>
                Add an income transaction to see revenue sources.
              </div>
            )}
          </div>
        </div>

        {/* Card 5: Recent Activity */}
        <div className="card span2">
          <h2>Recent ledger activity</h2>
          <ul className="feed" id="feed">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 8).map((log, idx) => (
                <li key={idx}>
                  {log.txt}
                  <span>{formatRelativeTime(log.t)}</span>
                </li>
              ))
            ) : (
              <li style={{ color: 'var(--pl-text-muted)' }}>No recent activity.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Insights
