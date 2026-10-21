import React from 'react'
import { money } from '../utils/formatCurrency'
import { CATEGORIES } from '../hooks/useExpenses'

function SortIcon({ isActive, isAsc }) {
  if (!isActive) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 15 12 20 17 15" />
        <polyline points="7 9 12 4 17 9" />
      </svg>
    )
  }
  if (isAsc) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

export function ExpenseList({
  visibleTransactions,
  monthTransactions,
  sort,
  sortBy,
  openExpenseDialog,
  setDeleteConfirmId,
}) {
  const categoryColorMap = Object.fromEntries(CATEGORIES)

  if (visibleTransactions.length === 0) {
    return (
      <div className="pocket-ledger-table-wrap">
        <div className="pocket-ledger-empty-state">
          <b>No expenses found</b>
          <span>
            {monthTransactions.length
              ? 'Try a different search or category.'
              : 'Use + Add expense to record your first one.'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="pocket-ledger-table-wrap">
      <table className="pocket-ledger-separated-table">
        <thead>
          <tr>
            <th className="pocket-ledger-th-date">
              <button
                type="button"
                onClick={() => sortBy('date')}
                className={`pocket-ledger-th-sort-btn ${sort.key === 'date' ? 'is-active' : ''}`}
              >
                <span>Date</span>
                <span className="pocket-ledger-sort-badge">
                  <SortIcon isActive={sort.key === 'date'} isAsc={sort.direction === 1} />
                </span>
                <div className="pocket-ledger-th-tooltip">
                  <span className="pocket-ledger-th-tooltip-dot" />
                  <span>
                    Sort Date {sort.key === 'date' ? (sort.direction === 1 ? 'Descending' : 'Ascending') : 'Ascending'}
                  </span>
                </div>
              </button>
            </th>

            <th>Category</th>
            <th>Note</th>

            <th className="pocket-ledger-th-amount pocket-ledger-align-right">
              <button
                type="button"
                onClick={() => sortBy('amt')}
                className={`pocket-ledger-th-sort-btn ${sort.key === 'amt' ? 'is-active' : ''}`}
              >
                <span>Amount</span>
                <span className="pocket-ledger-sort-badge">
                  <SortIcon isActive={sort.key === 'amt'} isAsc={sort.direction === 1} />
                </span>
                <div className="pocket-ledger-th-tooltip">
                  <span className="pocket-ledger-th-tooltip-dot" />
                  <span>
                    Sort Amount {sort.key === 'amt' ? (sort.direction === 1 ? 'Descending' : 'Ascending') : 'Ascending'}
                  </span>
                </div>
              </button>
            </th>

            <th className="pocket-ledger-align-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleTransactions.map((item) => {
            const dateObj = new Date(`${item.date}T00:00:00`)
            const dayNum = dateObj.getDate() || item.date?.split('-')[2] || '01'
            const monthStr = dateObj.toLocaleDateString(undefined, { month: 'short' }) || ''
            const yearStr = dateObj.getFullYear() || ''

            return (
              <tr key={item.id}>
                <td>
                  <div className="pocket-ledger-date-pill">
                    <span className="pocket-ledger-date-day">{dayNum}</span>
                    <div className="pocket-ledger-date-meta">
                      <span className="pocket-ledger-date-month">{monthStr}</span>
                      <span className="pocket-ledger-date-year">{yearStr}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="pocket-ledger-category-dot"
                    style={{ background: categoryColorMap[item.cat] || '#64748b' }}
                  />
                  {item.cat}
                </td>
                <td>{item.note || '—'}</td>
                <td className="pocket-ledger-align-right">
                  <b>{money(item.amt)}</b>
                </td>
                <td className="pocket-ledger-align-right">
                  <button
                    type="button"
                    className="pocket-ledger-ghost-button"
                    onClick={() => openExpenseDialog(item)}
                  >
                    Edit
                  </button>{' '}
                  <button
                    type="button"
                    className="pocket-ledger-ghost-button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    style={{ color: 'var(--pocket-out)' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseList
