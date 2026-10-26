import React, { useState } from 'react'
import { MonthPickerPopover } from './common/MonthPickerPopover'

export function Header({
  page,
  month,
  changeMonth,
  search = '',
  setSearch,
  openTransactionDialog,
  openCsvModal,
  _theme = 'dark',
  _toggleTheme,
  openFilterDrawer,
  isFilterDrawerOpen = false,
  activeFilterCount = 0,
}) {
  const isDashboard = page === 'dashboard' || page === 'insights'
  const isWallets = page === 'wallets'
  const isSettings = page === 'settings'
  const isTxn = !isDashboard && !isWallets && !isSettings
  const showMonthSwitch = isTxn || isDashboard

  const [showPicker, setShowPicker] = useState(false)

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

  const renderMonthSwitcher = () => {
    if (!month || !changeMonth) return null

    return (
      <div
        className="header-month-switcher"
        role="group"
        aria-label="Choose month"
        style={{ position: 'relative' }}
      >
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

        <button
          type="button"
          id="mlabel"
          aria-live="polite"
          aria-haspopup="dialog"
          aria-expanded={showPicker}
          onClick={() => setShowPicker((prev) => !prev)}
          className="header-month-label"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 8px',
            borderRadius: '12px',
            transition: 'background 0.15s ease',
          }}
          title="Click to choose month and year"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{monthDisplay}</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

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

        <MonthPickerPopover
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          currentYear={month.year}
          currentMonth={month.month}
          onSelectMonth={(target) => {
            changeMonth(target)
          }}
        />
      </div>
    )
  }

  return (
    <div className="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <h1 id="title">{title}</h1>

        {!isDashboard && showMonthSwitch && renderMonthSwitcher()}
      </div>

      <div className="actions">
        {/* Month Selector in Top-Right Corner for Dashboard view */}
        {isDashboard && renderMonthSwitcher()}

        {isTxn && openFilterDrawer && (
          <button
            type="button"
            id="btn-filter"
            className={`ghost filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
            onClick={openFilterDrawer}
            title="Filter transactions"
            aria-label="Filter transactions"
            aria-expanded={isFilterDrawerOpen}
          >
            <svg
              width="15"
              height="15"
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
                  background: 'var(--pl-color-primary)',
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

        {isTxn && openCsvModal && (
          <button
            type="button"
            className="ghost"
            onClick={openCsvModal}
            title="Import bank statements or CSV file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="hide-s">Import</span>
          </button>
        )}

        {isTxn && openTransactionDialog && (
          <button
            className="primary"
            id="open"
            type="button"
            onClick={() => openTransactionDialog()}
          >
            <span aria-hidden="true" style={{ fontSize: '15px', fontWeight: 800 }}>+</span>
            <span>Transaction</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default Header
