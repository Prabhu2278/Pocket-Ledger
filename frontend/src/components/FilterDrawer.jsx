import React, { useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { money } from '../utils/formatCurrency'

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
  paymentMethodFilter = 'all',
  setPaymentMethodFilter,
  wallets = [],
  currency = 'INR',
  totalFilteredCount = 0,
  activeFilterCount = 0,
  onResetFilters,
}) {
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

  if (!isOpen) return null

  // Combined categories based on active type
  const availableCategories =
    typeFilter === 'income'
      ? ['All', ...INCOME_CATEGORIES.map((c) => c[0])]
      : typeFilter === 'expense'
      ? ['All', ...EXPENSE_CATEGORIES.map((c) => c[0])]
      : typeFilter === 'transfer'
      ? ['All', 'Transfer']
      : [
          'All',
          ...Array.from(
            new Set([
              ...EXPENSE_CATEGORIES.map((c) => c[0]),
              ...INCOME_CATEGORIES.map((c) => c[0]),
              'Transfer',
            ])
          ),
        ]

  const paymentMethods = [
    'All',
    'UPI',
    'Bank Transfer',
    'Cash',
    'Credit Card',
    'Debit Card',
    'Wallet Transfer',
    'Net Banking',
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
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Filters Form */}
        <div className="filter-drawer-body">
          {/* 1. Transaction Type */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
              Transaction Type
            </label>
            <div className="chips" role="radiogroup" aria-label="Transaction Type Filter" style={{ marginBottom: 0 }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'expense', label: 'Expenses' },
                { id: 'income', label: 'Income' },
                { id: 'transfer', label: 'Transfers' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  aria-pressed={typeFilter === t.id}
                  onClick={() => {
                    setTypeFilter(t.id)
                    setCategoryFilter('All')
                  }}
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Wallet / Account Filter */}
          <div>
            <label
              htmlFor="drawer-wallet-select"
              style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}
            >
              Account / Wallet
            </label>
            <select
              id="drawer-wallet-select"
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--pl-radius-md)',
                border: '1px solid var(--pl-border-default)',
                background: 'var(--pl-bg-surface)',
                color: 'var(--pl-text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="all">All Accounts</option>
              {wallets.map((w) => {
                const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                return (
                  <option key={w.id} value={String(w.id)}>
                    {w.name} ({money(bal, currency)})
                  </option>
                )
              })}
            </select>
          </div>

          {/* 3. Category Filter Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>
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

            <div className="chips" role="radiogroup" aria-label="Category Selection" style={{ gap: '6px', marginBottom: 0 }}>
              {availableCategories.map((name) => {
                const isSelected = categoryFilter === name
                return (
                  <button
                    key={name}
                    type="button"
                    className="chip"
                    aria-pressed={isSelected}
                    onClick={() => setCategoryFilter(name)}
                    style={{
                      fontSize: '11.5px',
                      padding: '4px 10px',
                      minHeight: '28px',
                      background: isSelected ? 'var(--pl-color-primary)' : 'var(--pl-bg-surface)',
                      color: isSelected ? '#fff' : 'var(--pl-text-primary)',
                      borderColor: isSelected ? 'var(--pl-color-primary)' : 'var(--pl-border-default)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {name === 'All' ? 'All' : name}
                  </button>
                )
              })}
            </div>
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
                <input
                  id="drawer-date-from"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  To
                </span>
                <input
                  id="drawer-date-to"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
                  placeholder="Min ₹"
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
                  placeholder="Max ₹"
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

          {/* 6. Payment Method */}
          <div>
            <label
              htmlFor="drawer-payment-select"
              style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}
            >
              Payment Method
            </label>
            <select
              id="drawer-payment-select"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--pl-radius-md)',
                border: '1px solid var(--pl-border-default)',
                background: 'var(--pl-bg-surface)',
                color: 'var(--pl-text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm === 'All' ? 'all' : pm}>
                  {pm === 'All' ? 'All Payment Methods' : pm}
                </option>
              ))}
            </select>
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
            Show {totalFilteredCount} {totalFilteredCount === 1 ? 'Result' : 'Results'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterDrawer
