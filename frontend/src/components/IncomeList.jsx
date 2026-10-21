import React from 'react'
import { money } from '../utils/formatCurrency'
import { getCategoryColor } from '../constants/categories'

export function IncomeList({
  visibleIncomes = [],
  monthIncomes = [],
  sort = { key: 'date', direction: -1 },
  currency = 'INR',
  onSort,
  onEdit,
  onDelete,
}) {
  if (visibleIncomes.length === 0) {
    return (
      <div className="empty">
        <b>No income records found</b>
        {monthIncomes.length > 0
          ? 'Try a different search or category.'
          : 'Use + Add income to record your first income source.'}
      </div>
    )
  }

  const renderTh = (key, label, isRight = false) => {
    const isSorted = sort.key === key || (key === 'amt' && sort.key === 'amount') || (key === 'date' && sort.key === 'received_on')
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
            <th>Description / Source</th>
            <th className="hide-s">Category</th>
            {renderTh('amt', 'Amount', true)}
            <th>
              <span style={{ position: 'absolute', left: '-9999px' }}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleIncomes.map((inc) => {
            const rawDate = inc.received_on || inc.date
            const dateObj = rawDate ? new Date(rawDate.includes('T') ? rawDate : `${rawDate}T00:00`) : new Date()
            const dateStr = dateObj.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
            })
            const cat = inc.cat || inc.category || 'Salary'
            const note = inc.note || inc.title || cat
            const amountVal = Number(inc.amt || inc.amount || 0)

            return (
              <tr key={inc.id}>
                <td>{dateStr}</td>
                <td>{note}</td>
                <td className="hide-s">
                  <span
                    className="dot"
                    style={{ background: getCategoryColor(cat) }}
                  ></span>
                  {cat}
                </td>
                <td className="r pos">+{money(amountVal, currency)}</td>
                <td className="r" style={{ whiteSpace: 'nowrap' }}>
                  <button
                    className="rowbtn"
                    type="button"
                    aria-label={`Edit ${note}`}
                    onClick={() => onEdit(inc)}
                  >
                    Edit
                  </button>
                  <button
                    className="rowbtn"
                    type="button"
                    aria-label={`Delete ${note}`}
                    onClick={() => onDelete(inc.id)}
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

export default IncomeList
