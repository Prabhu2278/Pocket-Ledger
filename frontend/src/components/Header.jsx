import React from 'react'

export function Header({
  page,
  month,
  changeMonth,
  search = '',
  setSearch,
  openTransactionDialog,
  openCsvModal,
  theme = 'dark',
  toggleTheme,
  openFilterDrawer,
  isFilterDrawerOpen = false,
  activeFilterCount = 0,
}) {
  const isDashboard = page === 'dashboard' || page === 'insights'
  const isWallets = page === 'wallets'
  const isSettings = page === 'settings'
  const isTxn = !isDashboard && !isWallets && !isSettings
  const showMonthSwitch = isTxn || isDashboard

  let title = 'Transactions'
  if (isDashboard) title = 'Dashboard'
  else if (isWallets) title = 'Wallets'
  else if (isSettings) title = 'Settings'

  const monthDisplay = month
    ? new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <div className="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <h1 id="title">{title}</h1>

        {showMonthSwitch && month && changeMonth && (
          <div className="header-month-switcher" role="group" aria-label="Choose month">
            <button
              id="prev"
              className="header-month-btn"
              aria-label="Previous month"
              type="button"
              onClick={() => changeMonth(-1)}
              title="Previous month"
            >
              ‹
            </button>
            <span id="mlabel" aria-live="polite" className="header-month-label">
              {monthDisplay}
            </span>
            <button
              id="next"
              className="header-month-btn"
              aria-label="Next month"
              type="button"
              onClick={() => changeMonth(1)}
              title="Next month"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="actions">
        {isTxn && openFilterDrawer && (
          <button
            type="button"
            id="btn-filter"
            className={`ghost filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
            style={{
              padding: '0 12px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13.5px',
              fontWeight: 600,
              borderColor: activeFilterCount > 0 ? 'var(--acc)' : undefined,
              color: activeFilterCount > 0 ? 'var(--acc)' : undefined,
            }}
            onClick={openFilterDrawer}
            title="Filter transactions"
            aria-label="Filter transactions"
            aria-expanded={isFilterDrawerOpen}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="hide-s">Filter</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: 'var(--acc)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  lineHeight: '1.2',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

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
