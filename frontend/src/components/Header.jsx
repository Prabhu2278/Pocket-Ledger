import React from 'react'

export function Header({
  page,
  search = '',
  setSearch,
  openTransactionDialog,
  openCsvModal,
  theme = 'dark',
  toggleTheme,
}) {
  const isInsights = page === 'insights'
  const isSettings = page === 'settings'
  const isTxn = !isInsights && !isSettings

  let title = 'Transactions'
  if (isInsights) title = 'Insights'
  else if (isSettings) title = 'Settings'

  return (
    <div className="top">
      <h1 id="title">{title}</h1>
      <div className="actions">
        {isTxn && setSearch && (
          <input
            id="q"
            type="search"
            placeholder="Search transactions..."
            aria-label="Search transactions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {isTxn && openCsvModal && (
          <button
            type="button"
            className="ghost"
            style={{
              padding: '0 14px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
            }}
            onClick={openCsvModal}
            title="Import bank statements or CSV file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="hide-s">Import CSV</span>
          </button>
        )}

        {isTxn && openTransactionDialog && (
          <button
            className="primary"
            id="open"
            type="button"
            onClick={() => openTransactionDialog()}
          >
            + Add transaction
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
