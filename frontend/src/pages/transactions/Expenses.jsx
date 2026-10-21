import React, { useState, useMemo } from 'react'
import './Expenses.css'
import { TransactionTable } from './components/TransactionTable'
import { money } from '@/utils/formatters'
import { CATEGORIES } from '@/constants/categories'

export function Expenses({
  transactions = [],
  monthTransactions = [],
  wallets = [],
  totalSpent = 0,
  budgetLeft = 0,
  rankedCategories = [],
  onEdit,
  onDelete,
}) {
  const [filter, setFilter] = useState('All')
  const [txnType, setTxnType] = useState('ALL')
  const [selectedWalletId, setSelectedWalletId] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', direction: -1 })
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const handleSort = (key) => {
    setSort((curr) => {
      if (curr.key === key) {
        return { key, direction: curr.direction === 1 ? -1 : 1 }
      }
      return { key, direction: -1 }
    })
  }

  const visibleTransactions = useMemo(() => {
    let rows = monthTransactions.length ? monthTransactions : transactions

    if (txnType !== 'ALL') {
      rows = rows.filter((item) => (item.type || 'EXPENSE') === txnType)
    }

    if (selectedWalletId !== 'ALL') {
      rows = rows.filter((item) => String(item.wallet_id || item.walletId) === String(selectedWalletId))
    }

    if (filter !== 'All') {
      rows = rows.filter((item) => (item.cat || item.category) === filter)
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim()
      rows = rows.filter((item) => {
        const text = `${item.note || item.notes || ''} ${item.cat || item.category || ''}`.toLowerCase()
        return text.includes(term)
      })
    }

    return [...rows].sort((a, b) => {
      if (sort.key === 'amount' || sort.key === 'amt') {
        const amtA = Number(a.amt || a.amount || 0)
        const amtB = Number(b.amt || b.amount || 0)
        return (amtA - amtB) * sort.direction
      }
      const dateA = a.date || a.spent_on || ''
      const dateB = b.date || b.spent_on || ''
      return (dateA.localeCompare(dateB) || a.id - b.id) * sort.direction
    })
  }, [monthTransactions, transactions, txnType, selectedWalletId, filter, search, sort])

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === visibleTransactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleTransactions.map((t) => t.id)))
    }
  }

  return (
    <section className="pocket-ledger-expenses-view" aria-label="Expenses module">
      <div className="pocket-ledger-kpi-grid">
        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Spent this month</span>
          <b>{money(totalSpent)}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Left in budget</span>
          <b>
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft))}
          </b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Transactions</span>
          <b>{monthTransactions.length || transactions.length}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Biggest category</span>
          <b>{rankedCategories[0] || 'None yet'}</b>
        </div>
      </div>

      <div className="pocket-ledger-card">
        {/* Type Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
            <button
              key={t}
              type="button"
              className={`pocket-ledger-chip ${txnType === t ? 'pocket-ledger-chip-active' : ''}`}
              onClick={() => setTxnType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="pocket-ledger-category-filters" role="group" aria-label="Category filters">
          {['All', ...CATEGORIES.map((c) => c.name)].map((name) => (
            <button
              key={name}
              type="button"
              className="pocket-ledger-chip"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="pocket-ledger-table-wrap" style={{ marginTop: '16px' }}>
          <TransactionTable
            transactions={visibleTransactions}
            sort={sort}
            onSort={handleSort}
            isEditMode={isEditMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            allSelected={selectedIds.size === visibleTransactions.length && visibleTransactions.length > 0}
            wallets={wallets}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </section>
  )
}

export default Expenses
