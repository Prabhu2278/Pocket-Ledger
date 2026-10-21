import React from 'react'
import { money } from '../utils/formatCurrency'

export function Sidebar({ page, month, changeMonth, totalSpent, budget, budgetPercent }) {
  const monthDisplay = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  return (
    <aside className="pocket-ledger-sidebar">
      <div className="pocket-ledger-brand">
        Pocket Ledger
      </div>

      <nav className="pocket-ledger-navigation" aria-label="Modules">
        <a
          href="#/expenses"
          className={
            page === 'expenses'
              ? 'pocket-ledger-nav-link pocket-ledger-nav-active'
              : 'pocket-ledger-nav-link'
          }
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
          className={
            page === 'insights'
              ? 'pocket-ledger-nav-link pocket-ledger-nav-active'
              : 'pocket-ledger-nav-link'
          }
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

        <a
          href="#/dashboard"
          className={
            page === 'dashboard'
              ? 'pocket-ledger-nav-link pocket-ledger-nav-active'
              : 'pocket-ledger-nav-link'
          }
          aria-current={page === 'dashboard' ? 'page' : undefined}
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
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </a>

        <a
          href="#/settings"
          className={
            page === 'settings'
              ? 'pocket-ledger-nav-link pocket-ledger-nav-active'
              : 'pocket-ledger-nav-link'
          }
          aria-current={page === 'settings' ? 'page' : undefined}
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </a>
      </nav>

      <div
        className="pocket-ledger-month-picker"
        role="group"
        aria-label="Choose month"
      >
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>

        <span>{monthDisplay}</span>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="pocket-ledger-sidebar-budget">
        <span>Budget used</span>
        <b>
          {money(totalSpent)} of {money(budget)}
        </b>

        <div className="pocket-ledger-budget-meter">
          <i style={{ width: `${Math.min(budgetPercent * 100, 100)}%` }} />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
