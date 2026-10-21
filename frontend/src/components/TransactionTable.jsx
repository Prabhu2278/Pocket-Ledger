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
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--pl-text-secondary)', fontSize: '12px' }}>
                  {dateStr}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--pl-text-primary)' }}>
                  {note}
                </td>
                <td className="hide-s">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--pl-text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      className="dot"
                      style={{ background: isTransfer ? 'var(--pl-color-info)' : getCategoryColor(cat) }}
                    ></span>
                    {cat}
                  </span>
                </td>
                <td className="hide-s">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: isTransfer ? 'var(--pl-color-info)' : 'var(--pl-text-muted)',
                      fontWeight: 600,
                      background: isTransfer ? 'var(--pl-color-info-soft)' : 'var(--pl-bg-muted)',
                      padding: '2px 8px',
                      borderRadius: 'var(--pl-radius-sm)',
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
                      borderRadius: 'var(--pl-radius-sm)',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      background: isIncome
                        ? 'var(--pl-color-success-soft)'
                        : isTransfer
                        ? 'var(--pl-color-info-soft)'
                        : 'var(--pl-color-danger-soft)',
                      color: isIncome
                        ? 'var(--pl-color-success)'
                        : isTransfer
                        ? 'var(--pl-color-info)'
                        : 'var(--pl-color-danger)',
                    }}
                  >
                    {isIncome ? 'INCOME' : isTransfer ? 'TRANSFER' : 'EXPENSE'}
                  </span>
                </td>
                <td
                  className={`r ${isIncome ? 'pos' : isTransfer ? '' : 'neg'}`}
                  style={{
                    whiteSpace: 'nowrap',
                    fontWeight: 800,
                    fontSize: '13px',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isTransfer ? 'var(--pl-text-primary)' : undefined,
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
                    title="Edit transaction"
                    onClick={() => onEdit(tx)}
                  >
                    ✎
                  </button>
                  <button
                    className="rowbtn del"
                    type="button"
                    aria-label={`Delete ${note}`}
                    title="Delete transaction"
                    onClick={() => onDelete(tx.id, tx.type)}
                  >
                    ✕
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
