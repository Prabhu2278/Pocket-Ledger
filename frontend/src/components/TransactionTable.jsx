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

  const renderTh = (key, label, isRight = false, className = '') => {
    const isSorted =
      sort.key === key ||
      (key === 'amt' && sort.key === 'amount') ||
      (key === 'date' && (sort.key === 'spent_on' || sort.key === 'received_on')) ||
      (key === 'description' && sort.key === 'note') ||
      (key === 'category' && sort.key === 'cat') ||
      (key === 'wallet' && sort.key === 'wallet_name')
    const arrowChar = isSorted ? (sort.direction > 0 ? '↑' : '↓') : '↓'
    const ariaSort = isSorted ? (sort.direction > 0 ? 'ascending' : 'descending') : 'none'

    return (
      <th className={`${isRight ? 'r' : ''} ${className}`.trim()} aria-sort={ariaSort}>
        <button type="button" onClick={() => onSort(key)}>
          <span>{label}</span>
          <span className={`sort-arrow ${isSorted ? 'active' : 'inactive'}`} aria-hidden="true">
            {arrowChar}
          </span>
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
            {renderTh('description', 'Description')}
            {renderTh('category', 'Category', false, 'hide-s')}
            {renderTh('wallet', 'Wallet', false, 'hide-s')}
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
                <td>
                  <div className="dashboard-txn-date-cell">
                    <span className={`dashboard-txn-type-icon ${tType}`} aria-hidden="true">
                      {isIncome ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      ) : isTransfer ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 3l4 4-4 4" />
                          <path d="M20 7H4" />
                          <path d="M8 21l-4-4 4-4" />
                          <path d="M4 17h16" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="7" x2="17" y2="17" />
                          <polyline points="17 7 17 17 7 17" />
                        </svg>
                      )}
                    </span>
                    <span>{dateStr}</span>
                  </div>
                </td>
                <td>
                  <span className="dashboard-txn-desc" title={note}>
                    {note}
                  </span>
                </td>
                <td className="hide-s">
                  <span
                    className="dashboard-badge"
                    style={{
                      backgroundColor: `${getCategoryColor(cat)}14`,
                      color: getCategoryColor(cat),
                      borderColor: `${getCategoryColor(cat)}30`,
                    }}
                  >
                    <span className="dashboard-badge-dot" style={{ backgroundColor: getCategoryColor(cat) }} />
                    {cat}
                  </span>
                </td>
                <td className="hide-s">
                  <span className="dashboard-txn-wallet" title={accountDisplay}>
                    <span className="dashboard-txn-wallet-icon" aria-hidden="true">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </span>
                    <span>{accountDisplay}</span>
                  </span>
                </td>
                <td>
                  <span className={`dashboard-type-pill ${tType}`}>
                    <span className="dashboard-type-pill-dot" />
                    {isIncome ? 'Income' : isTransfer ? 'Transfer' : 'Expense'}
                  </span>
                </td>
                <td className="r">
                  <span className={`dashboard-txn-amount ${tType}`}>
                    {isIncome ? `+${money(amountVal, currency)}` : isTransfer ? money(amountVal, currency) : `-${money(amountVal, currency)}`}
                  </span>
                </td>
                <td className="r" style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="rowbtn edit"
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
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
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
