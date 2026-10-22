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
            <th className="hide-s">Wallet</th>
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>{accountDisplay}</span>
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
                    fontSize: '12px',
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
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="rowbtn del"
                    type="button"
                    aria-label={`Delete ${note}`}
                    title="Delete transaction"
                    onClick={() => onDelete(tx.id, tx.type)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
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
