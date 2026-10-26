import React, { useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { CURRENCY_CONFIGS } from '../utils/formatCurrency'
import { CustomDatePicker } from './ui/CustomDatePicker/CustomDatePicker'
import { CustomDropdown } from './ui/CustomDropdown/CustomDropdown'

export function FilterDrawer({
  isOpen,
  onClose,
  typeFilter = 'all',
  setTypeFilter,
  categoryFilter = 'All',
  setCategoryFilter,
  walletFilter = 'all',
  setWalletFilter,
  minAmount = '',
  setMinAmount,
  maxAmount = '',
  setMaxAmount,
  startDate = '',
  setStartDate,
  endDate = '',
  setEndDate,
  wallets = [],
  currency = 'INR',
  totalFilteredCount = 0,
  activeFilterCount = 0,
  onResetFilters,
  categories = [],
}) {
  const currCode = (currency || 'INR').toUpperCase()
  const currSymbol = CURRENCY_CONFIGS[currCode]?.symbol || '₹'

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Scroll Lock: disable background/outside scrolling when filter drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
      document.documentElement.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Combined categories based on active type
  const dbExpense = categories.filter((c) => c.type === 'expense' && c.is_active).map((c) => c.name)
  const dbIncome = categories.filter((c) => c.type === 'income' && c.is_active).map((c) => c.name)

  const expList = Array.from(new Set([...EXPENSE_CATEGORIES.map((c) => c[0]), ...dbExpense]))
  const incList = Array.from(new Set([...INCOME_CATEGORIES.map((c) => c[0]), ...dbIncome]))

  const availableCategories =
    typeFilter === 'income'
      ? ['All', ...incList]
      : typeFilter === 'expense'
      ? ['All', ...expList]
      : typeFilter === 'transfer'
      ? ['All', 'Transfer']
      : [
          'All',
          ...Array.from(
            new Set([
              ...expList,
              ...incList,
              'Transfer',
            ])
          ),
        ]

  return (
    <div
      className="filter-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--pl-color-primary)"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <h2 id="filter-drawer-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
              Filter Transactions
            </h2>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: 'var(--pl-color-primary-soft)',
                  color: 'var(--pl-color-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: 'var(--pl-radius-pill)',
                  padding: '2px 8px',
                }}
              >
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="ghost"
                onClick={onResetFilters}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  minHeight: '32px',
                  color: 'var(--pl-color-danger)',
                }}
              >
                Reset All
              </button>
            )}
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              aria-label="Close filter panel"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--pl-radius-md)',
                fontSize: '15px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Filters Form */}
        <div className="filter-drawer-body">
          {/* 1. Wallet Filter */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="filter-drawer-wallet-select" style={{ fontSize: '12.5px', fontWeight: 700 }}>
                Wallet
              </label>
              {walletFilter !== 'all' && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setWalletFilter('all')}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    minHeight: '24px',
                    color: 'var(--pl-text-muted)',
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <CustomDropdown
              id="filter-drawer-wallet-select"
              value={walletFilter}
              onChange={(val) => setWalletFilter(val)}
              placeholder="Select Wallet"
              options={[
                { value: 'all', label: 'All Wallets' },
                ...wallets.map((w) => ({
                  value: String(w.id),
                  label: w.name,
                })),
              ]}
            />
          </div>

          {/* 2. Category Filter */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="filter-drawer-category-select" style={{ fontSize: '12.5px', fontWeight: 700 }}>
                Category
              </label>
              {categoryFilter !== 'All' && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setCategoryFilter('All')}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    minHeight: '24px',
                    color: 'var(--pl-text-muted)',
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            <CustomDropdown
              id="filter-drawer-category-select"
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              placeholder="Select Category"
              options={availableCategories.map((name) => ({
                value: name,
                label: name === 'All' ? 'All Categories' : name,
              }))}
            />
          </div>

          {/* 4. Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Date Range
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)', display: 'block', marginBottom: '3px' }}>
                  From
                </span>
                <CustomDatePicker
                  id="drawer-date-from"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  placeholder="From Date"
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)', display: 'block', marginBottom: '3px' }}>
                  To
                </span>
                <CustomDatePicker
                  id="drawer-date-to"
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  placeholder="To Date"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  minHeight: '26px',
                  marginTop: '6px',
                  color: 'var(--pl-text-muted)',
                }}
              >
                Clear date range
              </button>
            )}
          </div>

          {/* 5. Amount Range */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Amount Range ({currency})
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)', display: 'block', marginBottom: '3px' }}>
                  Min Amount
                </span>
                <input
                  id="drawer-amount-min"
                  type="number"
                  placeholder={`Min ${currSymbol}`}
                  min="0"
                  step="1"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--pl-radius-md)',
                    border: '1px solid var(--pl-border-default)',
                    background: 'var(--pl-bg-surface)',
                    color: 'var(--pl-text-primary)',
                    fontSize: '12.5px',
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)', display: 'block', marginBottom: '3px' }}>
                  Max Amount
                </span>
                <input
                  id="drawer-amount-max"
                  type="number"
                  placeholder={`Max ${currSymbol}`}
                  min="0"
                  step="1"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--pl-radius-md)',
                    border: '1px solid var(--pl-border-default)',
                    background: 'var(--pl-bg-surface)',
                    color: 'var(--pl-text-primary)',
                    fontSize: '12.5px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-drawer-footer">
          <button
            type="button"
            className="ghost"
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
            style={{
              flex: 1,
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              opacity: activeFilterCount === 0 ? 0.4 : 1,
              cursor: activeFilterCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="primary"
            onClick={onClose}
            style={{
              flex: 2,
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
            }}
          >
            Apply Filter ({totalFilteredCount} {totalFilteredCount === 1 ? 'Result' : 'Results'})
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterDrawer
