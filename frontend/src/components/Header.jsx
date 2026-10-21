import React from 'react'

export function Header({ page, search, setSearch, openExpenseDialog }) {
  const pageTitle =
    page === 'expenses'
      ? 'Expenses'
      : page === 'insights'
      ? 'Insights'
      : page === 'settings'
      ? 'Settings'
      : 'Dashboard'

  return (
    <div className="pocket-ledger-topbar">
      <h1>{pageTitle}</h1>

      <div className="pocket-ledger-actions">
        {page === 'expenses' && (
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search expenses"
            aria-label="Search expenses"
          />
        )}

        <button
          className="pocket-ledger-primary-button"
          type="button"
          onClick={() => openExpenseDialog()}
        >
          + Add expense
        </button>
      </div>
    </div>
  )
}

export default Header
