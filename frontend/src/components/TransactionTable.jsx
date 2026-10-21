import React from 'react'
import { money } from '../utils/formatCurrency'
import { getCategoryColor } from '../constants/categories'

export function TransactionTable({
  transactions = [],
  sort = { key: 'date', direction: -1 },
  currency = 'INR',
  onSort,
  onEdit,
  onDelete,
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty">
        <b>No transactions found</b>
        Try adjusting your filters, or use + Add transaction or Import CSV to record one.
      </div>
    )
  }

  const renderTh = (key, label, isRight = false) => {
    const isSorted =
      sort.key === key ||
      (key === 'amt' && sort.key === 'amount') ||
      (key === 'date' && (sort.key === 'spent_on' || sort.key === 'received_on'))
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
            <th className="hide-s">Account</th>
            <th>Type</th>
            {renderTh('amt', 'Amount', true)}
            <th>
              <span style={{ position: 'absolute', left: '-9999px' }}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const rawDate = tx.date || tx.spent_on || tx.received_on
            const dateObj = rawDate
              ? new Date(rawDate.includes('T') ? rawDate : `${rawDate}T00:00`)
              : new Date()
            const dateStr = dateObj.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
            })

            const tType = (tx.type || '').toLowerCase()
            const isIncome = tType === 'income'
            const isTransfer = tType === 'transfer'
            const cat = tx.category || tx.cat || (isIncome ? 'Salary' : isTransfer ? 'Transfer' : 'Other')
            const note = tx.note || tx.title || cat
            const amountVal = Number(tx.amount || tx.amt || 0)

            let accountDisplay = tx.wallet_name || 'Main Wallet'
            if (isTransfer) {
              const srcName = tx.wallet_name || 'Source'
              const destName = tx.to_wallet_name || 'Destination'
              accountDisplay = `${srcName} → ${destName}`
            }

            return (
              <tr key={`${tx.type}-${tx.id}`}>
                <td style={{ whiteSpace: 'nowrap' }}>{dateStr}</td>
                <td>{note}</td>
                <td className="hide-s">
                  <span
                    className="dot"
                    style={{ background: isTransfer ? '#3b82f6' : getCategoryColor(cat) }}
                  ></span>
                  {cat}
                </td>
                <td className="hide-s">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: isTransfer ? 'var(--acc)' : 'var(--mute)',
                      fontWeight: 600,
                    }}
                    title={accountDisplay}
                  >
                    💳 {accountDisplay}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      background: isIncome
                        ? 'var(--pos-soft)'
                        : isTransfer
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'var(--soft)',
                      color: isIncome
                        ? 'var(--pos)'
                        : isTransfer
                        ? '#3b82f6'
                        : 'var(--acc)',
                    }}
                  >
                    {isIncome ? 'INCOME' : isTransfer ? 'TRANSFER' : 'EXPENSE'}
                  </span>
                </td>
                <td
                  className={`r ${isIncome ? 'pos' : isTransfer ? '' : 'neg'}`}
                  style={{
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    color: isTransfer ? 'var(--ink)' : undefined,
                  }}
                >
                  {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                  {money(amountVal, currency)}
                </td>
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
                    onClick={() => onDelete(tx.id, tx.type)}
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

export default TransactionTable
