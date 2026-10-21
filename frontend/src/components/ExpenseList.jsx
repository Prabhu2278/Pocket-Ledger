import React from 'react'
import { money } from '../utils/formatCurrency'
import { getCategoryColor } from '../constants/categories'

export function ExpenseList({
  visibleTransactions = [],
  monthTransactions = [],
  sort = { key: 'date', direction: -1 },
  onSort,
  onEdit,
  onDelete,
}) {
  if (visibleTransactions.length === 0) {
    return (
      <div className="empty">
        <b>No expenses found</b>
        {monthTransactions.length > 0
          ? 'Try a different search or category.'
          : 'Use Add expense to record your first one.'}
      </div>
    )
  }

  const renderTh = (key, label, isRight = false) => {
    const isSorted = sort.key === key || (key === 'amt' && sort.key === 'amount') || (key === 'date' && sort.key === 'spent_on')
    const sortLabel = isSorted ? (sort.direction > 0 ? ' ↑' : ' ↓') : ''
    const ariaSort = isSorted ? (sort.direction > 0 ? 'ascending' : 'descending') : 'none'

    return (
      <th className={isRight ? 'r' : ''} aria-sort={ariaSort}>
        <button type="button" onClick={() => onSort(key)}>
          {label}
          {sortLabel}
        </button>
      </th>
    )
  }

  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            {renderTh('date', 'Date')}
            <th>Description</th>
            <th className="hide-s">Category</th>
            {renderTh('amt', 'Amount', true)}
            <th>
              <span style={{ position: 'absolute', left: '-9999px' }}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleTransactions.map((tx) => {
            const rawDate = tx.spent_on || tx.date
            const dateObj = rawDate ? new Date(rawDate.includes('T') ? rawDate : `${rawDate}T00:00`) : new Date()
            const dateStr = dateObj.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
            })
            const cat = tx.cat || tx.category || 'Other'
            const note = tx.note || tx.title || cat
            const amountVal = Number(tx.amt || tx.amount || 0)

            return (
              <tr key={tx.id}>
                <td>{dateStr}</td>
                <td>{note}</td>
                <td className="hide-s">
                  <span
                    className="dot"
                    style={{ background: getCategoryColor(cat) }}
                  ></span>
                  {cat}
                </td>
                <td className="r neg">-{money(amountVal)}</td>
                <td className="r" style={{ whiteSpace: 'nowrap' }}>
                  <button
                    className="rowbtn"
                    type="button"
                    aria-label={`Edit ${note}`}
                    onClick={() => onEdit(tx)}
                  >
                    Edit
                  </button>
                  <button
                    className="rowbtn"
                    type="button"
                    aria-label={`Delete ${note}`}
                    onClick={() => onDelete(tx.id)}
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
