import React from 'react'
import { TransactionTableRow } from './TransactionTableRow'

function SortBadge({ columnKey, sort }) {
  const isActive = sort?.key === columnKey && sort?.direction
  const isAsc = isActive && sort.direction === 1
  const isDesc = isActive && sort.direction === -1

  return (
    <span className="pocket-ledger-sort-badge" aria-hidden="true">
      {isAsc ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      ) : isDesc ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 15 12 20 17 15" />
          <polyline points="7 9 12 4 17 9" />
        </svg>
      )}
    </span>
  )
}

export function TransactionTable({
  transactions = [],
  sort,
  onSort,
  isEditMode,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  wallets = [],
  onEdit,
  onDelete,
}) {
  const walletMap = Object.fromEntries((wallets || []).map((w) => [w.id, w]))

  return (
    <table className="pocket-ledger-separated-table">
      <thead>
        <tr>
          {isEditMode && (
            <th className="pocket-ledger-col-checkbox">
              <input
                type="checkbox"
                className="pocket-ledger-table-checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all"
              />
            </th>
          )}

          <th className="pocket-ledger-th-date">
            <button
              type="button"
              className={`pocket-ledger-th-sort-btn ${sort?.key === 'date' ? 'is-active' : ''}`}
              onClick={() => onSort && onSort('date')}
            >
              <span>Date</span>
              <SortBadge columnKey="date" sort={sort} />
              <div className="pocket-ledger-th-tooltip">
                <span className="pocket-ledger-th-tooltip-dot" />
                <span>
                  Sort Date {sort?.direction === 1 ? 'Descending' : 'Ascending'}
                </span>
              </div>
            </button>
          </th>

          <th>Category</th>
          <th>Description</th>
          <th>Wallet</th>

          <th className="pocket-ledger-th-amount pocket-ledger-align-right">
            <button
              type="button"
              className={`pocket-ledger-th-sort-btn ${sort?.key === 'amount' || sort?.key === 'amt' ? 'is-active' : ''}`}
              onClick={() => onSort && onSort('amount')}
            >
              <span>Amount</span>
              <SortBadge columnKey="amount" sort={sort} />
              <div className="pocket-ledger-th-tooltip">
                <span className="pocket-ledger-th-tooltip-dot" />
                <span>
                  Sort Amount {sort?.direction === 1 ? 'Descending' : 'Ascending'}
                </span>
              </div>
            </button>
          </th>

          <th className="pocket-ledger-align-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((item) => (
          <TransactionTableRow
            key={item.id}
            item={item}
            isEditMode={isEditMode}
            isSelected={selectedIds?.has ? selectedIds.has(item.id) : false}
            onToggleSelect={onToggleSelect}
            sourceWallet={walletMap[item.wallet_id || item.walletId]}
            destWallet={walletMap[item.to_wallet_id || item.toWalletId]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

export default TransactionTable
