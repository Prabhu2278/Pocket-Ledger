import React, { useState, useMemo } from 'react'
import { money } from '../utils/formatCurrency'
import { TransactionTable } from '../components/TransactionTable'
import { exportTransactionsToCsv } from '../utils/csvExporter'
import { normalizeDateStr } from '../utils/dateUtils'
import { ConfirmModal } from '../components/ConfirmDialog'
import { CustomDropdown } from '../components/ui/CustomDropdown/CustomDropdown'

export function Transactions({
  transactions = [],
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  typeFilter = 'all', // 'all', 'income', 'expense', 'transfer'
  setTypeFilter,
  categoryFilter = 'All',
  setCategoryFilter,
  search = '',
  setSearch: _setSearch,
  sort = { key: 'date', direction: -1 },
  onSort,
  currency = 'INR',
  openTransactionDialog,
  onDeleteTransaction,
  openCsvModal: _openCsvModal,
  // Advanced filters from drawer
  walletFilter = 'all',
  minAmount = '',
  maxAmount = '',
  startDate = '',
  endDate = '',
  paymentMethodFilter = 'all',
  wallets: _wallets = [],
  setStartDate,
  setEndDate,
}) {
  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Pagination state (default: 10 per page)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Delete transaction confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleRequestDelete = (id, type) => {
    const item = transactions.find(
      (t) => String(t.id) === String(id) && (t.type || '').toLowerCase() === (type || '').toLowerCase()
    )
    setDeleteTarget({
      id,
      type: type || 'expense',
      note: item?.note || item?.title || item?.category || 'this transaction',
      amount: item?.amount || item?.amt || 0,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const { id, type } = deleteTarget
    setDeleteTarget(null)
    if (onDeleteTransaction) {
      await onDeleteTransaction(id, type)
    }
  }

  // Filter transactions for this month (default fallback)
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = normalizeDateStr(t.date || t.spent_on || t.received_on)
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [transactions, month])

  const hasCustomDateRange = Boolean(startDate || endDate)

  // Scope transactions: When a custom date range is set, search across all transactions
  // allowing data from previous or next months to be shown; otherwise default to monthTransactions
  const scopedTransactions = useMemo(() => {
    if (hasCustomDateRange) {
      const normStart = normalizeDateStr(startDate)
      const normEnd = normalizeDateStr(endDate)
      return transactions.filter((t) => {
        const d = normalizeDateStr(t.date || t.spent_on || t.received_on)
        if (!d) return false
        if (normStart && d < normStart) return false
        if (normEnd && d > normEnd) return false
        return true
      })
    }
    return monthTransactions
  }, [hasCustomDateRange, startDate, endDate, transactions, monthTransactions])

  // Reset pagination to page 1 whenever any filter or search changes
  const filterKey = `${typeFilter}-${categoryFilter}-${search}-${walletFilter}-${minAmount}-${maxAmount}-${startDate}-${endDate}-${paymentMethodFilter}-${monthKey}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setCurrentPage(1)
  }

  // Transaction counts for tabs
  const incomeCount = scopedTransactions.filter((t) => (t.type || '').toLowerCase() === 'income').length
  const expenseCount = scopedTransactions.filter((t) => (t.type || '').toLowerCase() === 'expense').length
  const transferCount = scopedTransactions.filter((t) => (t.type || '').toLowerCase() === 'transfer').length

  // Summary Metrics for top KPI cards
  const summaryIncome = useMemo(() => {
    return scopedTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [scopedTransactions])

  const summaryExpense = useMemo(() => {
    return scopedTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [scopedTransactions])

  const summaryNet = summaryIncome - summaryExpense

  // Filter and sort for the table
  const visibleTransactions = useMemo(() => {
    let rows = scopedTransactions

    // 1. Filter by type
    if (typeFilter === 'income') {
      rows = rows.filter((t) => (t.type || '').toLowerCase() === 'income')
    } else if (typeFilter === 'expense') {
      rows = rows.filter((t) => (t.type || '').toLowerCase() === 'expense')
    } else if (typeFilter === 'transfer') {
      rows = rows.filter((t) => (t.type || '').toLowerCase() === 'transfer')
    }

    // 2. Filter by category
    if (categoryFilter !== 'All') {
      rows = rows.filter((t) => (t.category || t.cat) === categoryFilter)
    }

    // 3. Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((t) => {
        const text = `${t.note || t.title || ''} ${t.category || t.cat || ''} ${t.type || ''}`.toLowerCase()
        return text.includes(q)
      })
    }

    // 4. Filter by Account / Wallet
    if (walletFilter && walletFilter !== 'all') {
      const wId = String(walletFilter)
      rows = rows.filter(
        (t) => String(t.wallet_id) === wId || String(t.to_wallet_id) === wId
      )
    }

    // 5. Filter by Min / Max Amount
    if (minAmount !== '' && !isNaN(Number(minAmount))) {
      const min = Number(minAmount)
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) >= min)
    }
    if (maxAmount !== '' && !isNaN(Number(maxAmount))) {
      const max = Number(maxAmount)
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) <= max)
    }

    // Sort
    return [...rows].sort((a, b) => {
      if (sort.key === 'amt' || sort.key === 'amount') {
        const valA = Number(a.amount || a.amt || 0)
        const valB = Number(b.amount || b.amt || 0)
        return (valA - valB) * sort.direction
      }

      if (sort.key === 'description' || sort.key === 'note') {
        const descA = (a.note || a.title || a.category || a.cat || '').toLowerCase()
        const descB = (b.note || b.title || b.category || b.cat || '').toLowerCase()
        const comp = descA.localeCompare(descB) || (a.id - b.id)
        return comp * sort.direction
      }

      if (sort.key === 'category' || sort.key === 'cat') {
        const catA = (a.category || a.cat || (a.type === 'income' ? 'Salary' : a.type === 'transfer' ? 'Transfer' : 'Other')).toLowerCase()
        const catB = (b.category || b.cat || (b.type === 'income' ? 'Salary' : b.type === 'transfer' ? 'Transfer' : 'Other')).toLowerCase()
        const comp = catA.localeCompare(catB) || (a.id - b.id)
        return comp * sort.direction
      }

      if (sort.key === 'wallet' || sort.key === 'wallet_name') {
        const getWalletLabel = (t) => {
          if ((t.type || '').toLowerCase() === 'transfer') {
            return `${t.wallet_name || 'Source'} → ${t.to_wallet_name || 'Destination'}`.toLowerCase()
          }
          return (t.wallet_name || 'Main Wallet').toLowerCase()
        }
        const walA = getWalletLabel(a)
        const walB = getWalletLabel(b)
        const comp = walA.localeCompare(walB) || (a.id - b.id)
        return comp * sort.direction
      }

      const dateA = normalizeDateStr(a.date || a.spent_on || a.received_on)
      const dateB = normalizeDateStr(b.date || b.spent_on || b.received_on)
      const comp = dateA.localeCompare(dateB) || a.id - b.id
      return comp * sort.direction
    })
  }, [
    scopedTransactions,
    typeFilter,
    categoryFilter,
    search,
    walletFilter,
    minAmount,
    maxAmount,
    sort,
  ])

  // Pagination calculations
  const totalCount = visibleTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const paginatedTransactions = useMemo(() => {
    return visibleTransactions.slice(startIndex, startIndex + pageSize)
  }, [visibleTransactions, startIndex, pageSize])

  // Smart pagination button generator
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null
    const pages = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages)
      }
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--pl-text-muted)', fontSize: '12px' }}>
            ...
          </span>
        )
      }
      const isCurrent = p === safeCurrentPage
      return (
        <button
          key={`page-btn-${p}`}
          type="button"
          onClick={() => setCurrentPage(p)}
          style={{
            minWidth: '32px',
            height: '32px',
            padding: '0 6px',
            borderRadius: 'var(--pl-radius-sm)',
            border: isCurrent ? '1px solid var(--pl-color-primary)' : '1px solid var(--pl-border-default)',
            background: isCurrent ? 'var(--pl-color-primary)' : 'var(--pl-bg-surface)',
            color: isCurrent ? '#fff' : 'var(--pl-text-primary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={`Page ${p}`}
        >
          {p}
        </button>
      )
    })
  }

  // Check if any filter is actively applied on the transactions view
  const isFilterApplied = useMemo(() => {
    return Boolean(
      (typeFilter && typeFilter.toLowerCase() !== 'all') ||
      (categoryFilter && categoryFilter !== 'All') ||
      (search && search.trim() !== '') ||
      (walletFilter && walletFilter !== 'all') ||
      (minAmount !== '' && !isNaN(Number(minAmount))) ||
      (maxAmount !== '' && !isNaN(Number(maxAmount))) ||
      startDate ||
      endDate
    )
  }, [typeFilter, categoryFilter, search, walletFilter, minAmount, maxAmount, startDate, endDate])

  const handleExportCsv = () => {
    // If any filter is applied on the table, export only the filtered data;
    // otherwise default to all transactions for that month
    const exportData = isFilterApplied ? visibleTransactions : monthTransactions

    if (!exportData || exportData.length === 0) {
      alert(
        isFilterApplied
          ? 'No matching filtered transactions to export.'
          : 'No transactions found for this month to export.'
      )
      return
    }

    let filename = `pocket_ledger_transactions_${monthKey}.csv`
    if (isFilterApplied) {
      if (hasCustomDateRange) {
        filename = `pocket_ledger_filtered_${startDate || 'start'}_to_${endDate || 'end'}.csv`
      } else {
        filename = `pocket_ledger_filtered_${monthKey}.csv`
      }
    }

    exportTransactionsToCsv(exportData, filename)
  }

  return (
    <section className="view on" id="v-transactions" aria-label="Transactions ledger">
      {/* Top Summary KPI Cards (Income, Expense, Total Transactions) */}
      <div className="transactions-kpis">
        {/* Card 1: Total Income */}
        <div
          className={`transactions-kpi-card income ${typeFilter === 'income' ? 'active' : ''}`}
          onClick={() => {
            setTypeFilter(typeFilter === 'income' ? 'all' : 'income')
            setCategoryFilter('All')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setTypeFilter(typeFilter === 'income' ? 'all' : 'income')
              setCategoryFilter('All')
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to filter by income"
        >
          <div className="transactions-kpi-top">
            <span className="transactions-kpi-label">TOTAL INCOME</span>
            <div className="transactions-kpi-badge income" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div className="transactions-kpi-amount pos">+{money(summaryIncome, currency)}</div>
          <div className="transactions-kpi-sub">
            <span className="transactions-kpi-pill income">{incomeCount} Incomes</span>
            <span>{hasCustomDateRange ? 'Filtered Range' : 'This Month'}</span>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div
          className={`transactions-kpi-card expense ${typeFilter === 'expense' ? 'active' : ''}`}
          onClick={() => {
            setTypeFilter(typeFilter === 'expense' ? 'all' : 'expense')
            setCategoryFilter('All')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setTypeFilter(typeFilter === 'expense' ? 'all' : 'expense')
              setCategoryFilter('All')
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to filter by expenses"
        >
          <div className="transactions-kpi-top">
            <span className="transactions-kpi-label">TOTAL EXPENSES</span>
            <div className="transactions-kpi-badge expense" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
          </div>
          <div className="transactions-kpi-amount neg">-{money(summaryExpense, currency)}</div>
          <div className="transactions-kpi-sub">
            <span className="transactions-kpi-pill expense">{expenseCount} Expenses</span>
            <span>{hasCustomDateRange ? 'Filtered Range' : 'This Month'}</span>
          </div>
        </div>

        {/* Card 3: Total Transactions & Net Balance */}
        <div
          className={`transactions-kpi-card total ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setTypeFilter('all')
            setCategoryFilter('All')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setTypeFilter('all')
              setCategoryFilter('All')
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view all transactions"
        >
          <div className="transactions-kpi-top">
            <span className="transactions-kpi-label">TOTAL TRANSACTIONS</span>
            <div className="transactions-kpi-badge total" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
          </div>
          <div className="transactions-kpi-amount">{scopedTransactions.length} Records</div>
          <div className="transactions-kpi-sub">
            <span className={`transactions-kpi-pill ${summaryNet >= 0 ? 'income' : 'expense'}`}>
              Net: {summaryNet >= 0 ? '+' : '-'}{money(Math.abs(summaryNet), currency)}
            </span>
            <span>{hasCustomDateRange ? 'Filtered Range' : 'This Month'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Custom Date Range Active Indicator */}
        {hasCustomDateRange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 14px',
              borderRadius: 'var(--pl-radius-md)',
              background: 'var(--pl-color-primary-soft)',
              border: '1px solid var(--pl-color-primary)',
              color: 'var(--pl-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '14px',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                Date Filter Active: <b>{startDate || 'Any start date'}</b> to <b>{endDate || 'Any end date'}</b> ({visibleTransactions.length} matching transactions from all months)
              </span>
            </div>
            {setStartDate && setEndDate && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '2px 10px',
                  minHeight: '26px',
                  color: 'var(--pl-color-primary)',
                  borderColor: 'currentColor',
                  cursor: 'pointer',
                }}
              >
                Clear Date Filter
              </button>
            )}
          </div>
        )}

        {/* Module Toolbar: Type Tabs & CSV Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Type Tabs */}
          <div className="chips" role="tablist" aria-label="Filter transaction types" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className="chip"
              role="tab"
              aria-selected={typeFilter === 'all'}
              aria-pressed={typeFilter === 'all'}
              onClick={() => {
                setTypeFilter('all')
                setCategoryFilter('All')
              }}
            >
              All ({scopedTransactions.length})
            </button>
            <button
              type="button"
              className="chip"
              role="tab"
              aria-selected={typeFilter === 'income'}
              aria-pressed={typeFilter === 'income'}
              onClick={() => {
                setTypeFilter('income')
                setCategoryFilter('All')
              }}
            >
              Income ({incomeCount})
            </button>
            <button
              type="button"
              className="chip"
              role="tab"
              aria-selected={typeFilter === 'expense'}
              aria-pressed={typeFilter === 'expense'}
              onClick={() => {
                setTypeFilter('expense')
                setCategoryFilter('All')
              }}
            >
              Expenses ({expenseCount})
            </button>
            <button
              type="button"
              className="chip"
              role="tab"
              aria-selected={typeFilter === 'transfer'}
              aria-pressed={typeFilter === 'transfer'}
              onClick={() => {
                setTypeFilter('transfer')
                setCategoryFilter('All')
              }}
            >
              Transfers ({transferCount})
            </button>
          </div>

          {/* CSV Import, Export, Pages Dropdown & Transfer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Pages dropdown near Import option */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="pages-select" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--pl-text-muted)' }}>
                Rows:
              </label>
              <CustomDropdown
                id="pages-select"
                value={pageSize}
                options={[
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 30, label: '30' },
                  { value: 50, label: '50' },
                ]}
                onChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
                style={{ width: '80px' }}
                triggerStyle={{ minHeight: '34px', height: '34px', padding: '4px 8px', fontSize: '12px' }}
              />
            </div>

            <button
              type="button"
              className="ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 12px',
                minHeight: '34px',
                height: '34px',
                fontSize: '12px',
              }}
              onClick={handleExportCsv}
              title={
                isFilterApplied
                  ? `Export ${visibleTransactions.length} filtered transactions as CSV`
                  : `Export all ${monthTransactions.length} transactions for this month as CSV`
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Transactions Table with Paginated Data */}
        <TransactionTable
          transactions={paginatedTransactions}
          sort={sort}
          currency={currency}
          onSort={onSort}
          onEdit={openTransactionDialog}
          onDelete={handleRequestDelete}
        />

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="pagination-bar">
            <div style={{ fontSize: '13px', color: 'var(--mute)', fontWeight: 500 }}>
              Showing <b>{startIndex + 1}</b> - <b>{Math.min(startIndex + pageSize, totalCount)}</b> of{' '}
              <b>{totalCount}</b> transactions
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="ghost"
                style={{
                  padding: '6px 12px',
                  minHeight: '34px',
                  fontSize: '12.5px',
                  opacity: safeCurrentPage <= 1 ? 0.4 : 1,
                  cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                }}
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹ Prev
              </button>

              {renderPaginationButtons()}

              <button
                type="button"
                className="ghost"
                style={{
                  padding: '6px 12px',
                  minHeight: '34px',
                  fontSize: '12.5px',
                  opacity: safeCurrentPage >= totalPages ? 0.4 : 1,
                  cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                }}
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Transaction Confirmation Alert */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${deleteTarget?.note}" (${money(deleteTarget?.amount || 0, currency)})? This will permanently remove the record from your ledger.`}
        confirmText="Delete Transaction"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default Transactions
