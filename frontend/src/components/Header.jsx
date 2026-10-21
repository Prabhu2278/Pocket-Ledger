import React from 'react'

export function Header({ page, search, setSearch, openExpenseDialog }) {
  const isExpenses = page === 'expenses'
  const title = page === 'insights' ? 'Insights' : page === 'settings' ? 'Settings' : 'Expenses'

  return (
    <div className="top">
      <h1 id="title">{title}</h1>
      <div className="actions">
        {isExpenses && (
          <input
            id="q"
            type="search"
            placeholder="Search expenses"
            aria-label="Search expenses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <button
          className="primary"
          id="open"
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
