import React from 'react'

export function Header({
  page,
  search = '',
  setSearch,
  incomeSearch = '',
  setIncomeSearch,
  openExpenseDialog,
  openIncomeDialog,
  theme = 'dark',
  toggleTheme,
}) {
  const isExpenses = page === 'expenses'
  const isIncome = page === 'income'
  const isInsights = page === 'insights'
  const isSettings = page === 'settings'

  let title = 'Expenses'
  if (isIncome) title = 'Income'
  else if (isInsights) title = 'Insights'
  else if (isSettings) title = 'Settings'

  return (
    <div className="top">
      <h1 id="title">{title}</h1>
      <div className="actions">
        {isExpenses && setSearch && (
          <input
            id="q"
            type="search"
            placeholder="Search expenses"
            aria-label="Search expenses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {isIncome && setIncomeSearch && (
          <input
            id="q-income"
            type="search"
            placeholder="Search income"
            aria-label="Search income"
            value={incomeSearch}
            onChange={(e) => setIncomeSearch(e.target.value)}
          />
        )}

        {toggleTheme && (
          <button
            type="button"
            className="ghost"
            style={{
              padding: '0 14px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="hide-s">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        )}

        {isIncome ? (
          <button
            className="primary"
            id="open-income"
            type="button"
            onClick={() => openIncomeDialog()}
          >
            + Add income
          </button>
        ) : isSettings ? null : (
          <button
            className="primary"
            id="open"
            type="button"
            onClick={() => openExpenseDialog()}
          >
            + Add expense
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
