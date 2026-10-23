import React, { useState, useEffect, useMemo } from 'react'
import { POPULAR_CURRENCIES } from '../utils/formatCurrency'
import '../styles/components/AddCurrencyModal.css'

const REGION_FILTERS = [
  { id: 'all', label: 'All Currencies' },
  { id: 'popular', label: 'Major' },
  { id: 'asia', label: 'Asia-Pacific' },
  { id: 'west', label: 'Americas & Europe' },
  { id: 'mideast', label: 'Middle East' },
]

const MAJOR_CODES = new Set(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'AED'])
const ASIA_CODES = new Set(['INR', 'JPY', 'SGD', 'AUD', 'NZD', 'CNY', 'KRW', 'MYR', 'THB', 'IDR', 'PHP'])
const WEST_CODES = new Set(['USD', 'EUR', 'GBP', 'CAD', 'CHF', 'BRL', 'MXN', 'RUB', 'TRY'])
const MIDEAST_CODES = new Set(['AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR'])

export function AddCurrencyModal({
  isOpen,
  onClose,
  onSelectCurrency,
  existingCodes = [],
  activeCurrency = 'INR',
}) {
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setRegionFilter('all')
      return
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')
    document.documentElement.classList.add('modal-open')

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [isOpen, onClose])

  // Filtered popular currencies
  const filteredPopular = useMemo(() => {
    const q = search.trim().toLowerCase()
    return POPULAR_CURRENCIES.filter((curr) => {
      // Region filter
      if (regionFilter === 'popular' && !MAJOR_CODES.has(curr.code)) return false
      if (regionFilter === 'asia' && !ASIA_CODES.has(curr.code)) return false
      if (regionFilter === 'west' && !WEST_CODES.has(curr.code)) return false
      if (regionFilter === 'mideast' && !MIDEAST_CODES.has(curr.code)) return false

      if (!q) return true
      return (
        curr.code.toLowerCase().includes(q) ||
        curr.name.toLowerCase().includes(q) ||
        curr.symbol.toLowerCase().includes(q)
      )
    })
  }, [search, regionFilter])

  if (!isOpen) return null

  const handleSelectPopular = (curr) => {
    onSelectCurrency(curr)
    onClose()
  }

  return (
    <div
      className="add-curr-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-currency-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="add-curr-box">
        {/* Modal Header */}
        <div className="add-curr-header">
          <div className="add-curr-header-info">
            <div className="add-curr-icon-badge" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
                <path d="M12 6v2m0 8v2" />
              </svg>
            </div>
            <div>
              <h3 id="add-currency-title" className="add-curr-title">
                Add New Currency
              </h3>
              <p className="add-curr-desc">
                Choose from world currencies to add to your ledger.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="add-curr-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Currency List & Controls */}
        <div className="add-curr-content">
          {/* Search Input Bar */}
          <div className="add-curr-search-wrap">
            <span className="add-curr-search-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="add-curr-search-input"
              style={{ paddingLeft: '44px', paddingRight: search ? '36px' : '14px' }}
              placeholder="Search by code or name (e.g., JPY, Yen, CAD, AED, Dirham)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="add-curr-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search query"
              >
                &times;
              </button>
            )}
          </div>

          {/* Region Filter Chips */}
          <div className="add-curr-filter-chips" role="group" aria-label="Filter currencies by region">
            {REGION_FILTERS.map((rf) => (
              <button
                key={rf.id}
                type="button"
                className={`add-curr-filter-chip ${regionFilter === rf.id ? 'active' : ''}`}
                onClick={() => setRegionFilter(rf.id)}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Currency Cards Grid */}
          <div className="add-curr-grid">
            {filteredPopular.length === 0 ? (
              <div className="add-curr-empty">
                <div className="add-curr-empty-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p>No currencies matched <b>"{search}"</b> in this category.</p>
              </div>
            ) : (
              filteredPopular.map((curr) => {
                const isExisting = existingCodes.includes(curr.code)
                const isActive = activeCurrency === curr.code

                return (
                  <div
                    key={curr.code}
                    className={`add-curr-card ${isActive ? 'active' : ''}`}
                  >
                    <div className="add-curr-card-sym" aria-hidden="true">
                      {curr.symbol}
                    </div>
                    <div className="add-curr-card-details">
                      <div className="add-curr-card-name" title={curr.name}>
                        {curr.name}
                      </div>
                      <div className="add-curr-card-code">
                        <code>{curr.code}</code>
                        {curr.code === 'INR' && (
                          <span className="add-curr-default-tag">Default</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`add-curr-card-btn ${isActive ? 'selected' : isExisting ? 'existing' : ''}`}
                      onClick={() => handleSelectPopular(curr)}
                      disabled={isActive}
                      aria-label={`Select ${curr.name} (${curr.code})`}
                    >
                      {isActive ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Active
                        </>
                      ) : isExisting ? (
                        'Select'
                      ) : (
                        '+ Add'
                      )}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCurrencyModal
