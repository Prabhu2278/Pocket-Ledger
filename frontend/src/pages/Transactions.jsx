import React, { useState, useMemo } from 'react'
import { money } from '../utils/formatCurrency'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { TransactionTable } from '../components/TransactionTable'
import { exportTransactionsToCsv } from '../utils/csvExporter'

export function Transactions({
  transactions = [],
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  typeFilter = 'all', // 'all', 'income', 'expense'
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
}) {
  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Filter transactions for this month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = t.date || t.spent_on || t.received_on
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [transactions, month])

  // Compute month KPIs
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() !== 'income')
      .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  const netCashFlow = totalIncome - totalExpense
  const incomeCount = monthTransactions.filter((t) => (t.type || '').toLowerCase() === 'income').length
  const expenseCount = monthTransactions.filter((t) => (t.type || '').toLowerCase() !== 'income').length

  // Filter and sort for the table
  const visibleTransactions = useMemo(() => {
    let rows = monthTransactions

    // Filter by type
    if (typeFilter === 'income') {
      rows = rows.filter((t) => (t.type || '').toLowerCase() === 'income')
    } else if (typeFilter === 'expense') {
      rows = rows.filter((t) => (t.type || '').toLowerCase() !== 'income')
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      rows = rows.filter((t) => (t.category || t.cat) === categoryFilter)
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((t) => {
        const text = `${t.note || t.title || ''} ${t.category || t.cat || ''} ${t.type || ''}`.toLowerCase()
        return text.includes(q)
      })
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
  }, [monthTransactions, typeFilter, categoryFilter, search, sort])

  // Category filter options depending on type
  const categoryOptions = useMemo(() => {
    if (typeFilter === 'income') {
      return ['All', ...INCOME_CATEGORIES.map((c) => c[0])]
    }
    if (typeFilter === 'expense') {
      return ['All', ...EXPENSE_CATEGORIES.map((c) => c[0])]
    }
    // Combined unique categories from data
    const set = new Set(['All'])
    monthTransactions.forEach((t) => {
      const c = t.category || t.cat
      if (c) set.add(c)
    })
    return Array.from(set)
  }, [typeFilter, monthTransactions])

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
          </div>

          {/* CSV Import & Export Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                minHeight: '38px',
                fontSize: '13px',
              }}
              onClick={openCsvModal}
              title="Import bank statements or CSV file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import CSV
            </button>

            <button
              type="button"
              className="ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                minHeight: '38px',
                fontSize: '13px',
              }}
              onClick={handleExportCsv}
              title="Export current transactions as CSV"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categoryOptions.length > 1 && (
          <div className="chips" role="group" aria-label="Filter by category" style={{ marginBottom: '14px' }}>
            {categoryOptions.map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={categoryFilter === name}
                onClick={() => setCategoryFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Transactions Table */}
        <TransactionTable
          transactions={visibleTransactions}
          sort={sort}
          currency={currency}
          onSort={onSort}
          onEdit={openTransactionDialog}
          onDelete={onDeleteTransaction}
        />
      </div>
    </section>
  )
}

export default Transactions
