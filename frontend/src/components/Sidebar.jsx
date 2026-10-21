import React from 'react'
import { money } from '../utils/formatCurrency'

export function Sidebar({
  page,
  month,
  changeMonth,
  totalSpent = 0,
  budget = 20000,
  budgetPercent = 0,
  currency = 'INR',
  user = null,
  onLogout,
}) {
  const monthDisplay = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  const clampedPct = Math.min(Math.max(budgetPercent, 0), 1)
  const isTxnActive = page === 'transactions' || page === 'expenses' || page === 'income'

  return (
    <aside className="side">
      <div className="brand">Pocket Ledger</div>

      <nav aria-label="Modules">
        <a
          href="#/transactions"
          id="n-transactions"
          aria-current={isTxnActive ? 'page' : undefined}
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
          Transactions
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

        <a
          href="#/settings"
          id="n-settings"
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
          {money(totalSpent, currency)} of {money(budget, currency)}
        </b>
        <div className="meter">
          <i id="sbbar" style={{ width: `${clampedPct * 100}%` }}></i>
        </div>
      </div>

      {user ? (
        <div className="side-user">
          <div className="side-user-info">
            <div className="side-user-name">{user.full_name || user.name || 'User'}</div>
            <div className="side-user-email">{user.email}</div>
          </div>
          <button
            type="button"
            className="side-logout-btn"
            onClick={onLogout}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="side-user">
          <div className="side-user-info">
            <div className="side-user-name">Guest session</div>
            <div className="side-user-email">Data saved locally</div>
          </div>
          <a
            href="#/login"
            className="side-logout-btn"
            style={{ textDecoration: 'none', color: 'var(--acc)' }}
          >
            Sign in
          </a>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
