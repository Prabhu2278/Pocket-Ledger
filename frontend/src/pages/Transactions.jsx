import React, { useState, useMemo } from 'react'
import { money } from '../utils/formatCurrency'
import { TransactionTable } from '../components/TransactionTable'
import { exportTransactionsToCsv } from '../utils/csvExporter'

export function Transactions({
  transactions = [],
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  typeFilter = 'all', // 'all', 'income', 'expense', 'transfer'
  setTypeFilter,
  categoryFilter = 'All',
  setCategoryFilter,
  search = '',
  setSearch,
  sort = { key: 'date', direction: -1 },
  onSort,
  currency = 'INR',
  openTransactionDialog,
  onDeleteTransaction,
  openCsvModal,
  // Advanced filters from drawer
  walletFilter = 'all',
  minAmount = '',
  maxAmount = '',
  startDate = '',
  endDate = '',
  paymentMethodFilter = 'all',
  wallets = [],
}) {
  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Pagination state (default: 10 per page)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter transactions for this month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = t.date || t.spent_on || t.received_on
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [transactions, month])

  // Reset pagination to page 1 whenever any filter or search changes
  const filterKey = `${typeFilter}-${categoryFilter}-${search}-${walletFilter}-${minAmount}-${maxAmount}-${startDate}-${endDate}-${paymentMethodFilter}-${monthKey}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setCurrentPage(1)
  }

  // Compute month KPIs
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  const totalTransfers = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'transfer')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  const netCashFlow = totalIncome - totalExpense
  const incomeCount = monthTransactions.filter((t) => (t.type || '').toLowerCase() === 'income').length
  const expenseCount = monthTransactions.filter((t) => (t.type || '').toLowerCase() === 'expense').length
  const transferCount = monthTransactions.filter((t) => (t.type || '').toLowerCase() === 'transfer').length

  // Filter and sort for the table
  const visibleTransactions = useMemo(() => {
    let rows = monthTransactions

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

    // 5. Filter by Date Range
    if (startDate) {
      rows = rows.filter((t) => {
        const d = t.date || t.spent_on || t.received_on || ''
        return d >= startDate
      })
    }
    if (endDate) {
      rows = rows.filter((t) => {
        const d = t.date || t.spent_on || t.received_on || ''
        return d <= endDate
      })
    }

    // 6. Filter by Min / Max Amount
    if (minAmount !== '' && !isNaN(Number(minAmount))) {
      const min = Number(minAmount)
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) >= min)
    }
    if (maxAmount !== '' && !isNaN(Number(maxAmount))) {
      const max = Number(maxAmount)
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) <= max)
    }

    // 7. Filter by Payment Method
    if (paymentMethodFilter && paymentMethodFilter !== 'all') {
      const pm = paymentMethodFilter.toLowerCase()
      rows = rows.filter((t) => (t.payment_method || '').toLowerCase() === pm)
    }

    // Sort
    return [...rows].sort((a, b) => {
      if (sort.key === 'amt' || sort.key === 'amount') {
        const valA = Number(a.amount || a.amt || 0)
        const valB = Number(b.amount || b.amt || 0)
        return (valA - valB) * sort.direction
      }
      const dateA = a.date || a.spent_on || a.received_on || ''
      const dateB = b.date || b.spent_on || b.received_on || ''
      const comp = dateA.localeCompare(dateB) || a.id - b.id
      return comp * sort.direction
    })
  }, [
    monthTransactions,
    typeFilter,
    categoryFilter,
    search,
    walletFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    paymentMethodFilter,
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

  const handleExportCsv = () => {
    const filename = `pocket_ledger_transactions_${monthKey}.csv`
    exportTransactionsToCsv(visibleTransactions, filename)
  }

  return (
    <section className="view on" id="v-transactions" aria-label="Transactions ledger">
      {/* KPI Cards */}
      <div className="kpis">
        <div className="card kpi">
          <span>Net Cash Flow</span>
          <b className={netCashFlow >= 0 ? 'pos' : 'neg'}>
            {netCashFlow >= 0 ? '+' : '-'}
            {money(Math.abs(netCashFlow), currency)}
          </b>
        </div>
        <div className="card kpi">
          <span>Total Income</span>
          <b className="pos">+{money(totalIncome, currency)}</b>
        </div>
        <div className="card kpi">
          <span>Total Expenses</span>
          <b className="neg">-{money(totalExpense, currency)}</b>
        </div>
        <div className="card kpi">
          <span>Total Transactions</span>
          <b>
            {monthTransactions.length}{' '}
            <small style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--mute)' }}>
              ({incomeCount} inc · {expenseCount} exp)
            </small>
          </b>
        </div>
      </div>

      <div className="card">
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
              All ({monthTransactions.length})
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
              <select
                id="pages-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--pl-radius-md)',
                  border: '1px solid var(--pl-border-default)',
                  background: 'var(--pl-bg-surface)',
                  color: 'var(--pl-text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '34px',
                  height: '34px',
                  width: 'auto',
                }}
                title="Number of transactions to show per page"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
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
              onClick={openCsvModal}
              title="Import bank statements or CSV file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Import</span>
            </button>

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
              title="Export current transactions as CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>

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
                color: 'var(--pl-color-primary)',
                borderColor: 'var(--pl-color-primary)',
                background: 'var(--pl-color-primary-soft)',
                fontWeight: 700,
              }}
              onClick={() => openTransactionDialog(null, 'transfer')}
              title="Transfer funds between accounts"
            >
              <span aria-hidden="true" style={{ fontSize: '13px' }}>⇄</span>
              <span>Transfer</span>
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
          onDelete={onDeleteTransaction}
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
    </section>
  )
}

export default Transactions
