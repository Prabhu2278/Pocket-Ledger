import React from 'react'
import { money } from '../utils/formatCurrency'

export function Sidebar({ page, month, changeMonth, totalSpent, budget, budgetPercent }) {
  const monthDisplay = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  const clampedPct = Math.min(Math.max(budgetPercent, 0), 1)

  return (
    <aside className="side">
      <div className="brand">Pocket Ledger</div>
      <nav aria-label="Modules">
        <a
          href="#/expenses"
          id="n1"
          aria-current={page === 'expenses' ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          Expenses
        </a>
        <a
          href="#/insights"
          id="n2"
          aria-current={page === 'insights' ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
          Insights
        </a>
      </nav>

      <div className="month" role="group" aria-label="Choose month">
        <button
          id="prev"
          aria-label="Previous month"
          type="button"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <span id="mlabel" aria-live="polite">
          {monthDisplay}
        </span>
        <button
          id="next"
          aria-label="Next month"
          type="button"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      <div className="sidebud">
        <span>Budget used</span>
        <b id="sbtxt">
          {money(totalSpent)} of {money(budget)}
        </b>
        <div className="meter">
          <i id="sbbar" style={{ width: `${clampedPct * 100}%` }}></i>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
