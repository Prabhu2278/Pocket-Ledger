import React from 'react'
import { getCategoryColor } from '@/constants/categories'
import { money } from '@/utils/formatters'

/**
 * TransactionTableRow
 * Renders an individual transaction row with interactive edit/delete buttons,
 * batch checkbox, category styling, wallet tagging, and transfer routing.
 */
export function TransactionTableRow({
  item,
  isEditMode,
  isSelected,
  onToggleSelect,
  sourceWallet,
  destWallet,
  onEdit,
  onDelete,
}) {
  const catColor = getCategoryColor(item.cat || item.category)
  const dateObj = new Date(`${item.date || item.spent_on}T00:00:00`)
  const dayNum = dateObj.getDate() || '01'
  const monthStr = dateObj.toLocaleDateString(undefined, { month: 'short' }) || ''
  const yearStr = dateObj.getFullYear() || ''
  const isTransfer = item.type === 'TRANSFER'
  const isIncome = item.type === 'INCOME'

  return (
    <tr
      className={`${isEditMode ? 'is-edit-mode' : ''} ${isSelected ? 'is-selected' : ''}`}
      onClick={(e) => {
        if (isEditMode && !e.target.closest('button') && e.target.type !== 'checkbox') {
          onToggleSelect && onToggleSelect(item.id)
        }
      }}
    >
      {isEditMode && (
        <td className="pocket-ledger-col-checkbox">
          <input
            type="checkbox"
            className="pocket-ledger-table-checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect && onToggleSelect(item.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select transaction ${item.note || item.cat}`}
          />
        </td>
      )}

      <td className="pocket-ledger-col-date">
        <div className="pocket-ledger-date-pill">
          <span className="pocket-ledger-date-day num">{dayNum}</span>
          <div className="pocket-ledger-date-meta">
            <span className="pocket-ledger-date-month">{monthStr}</span>
            <span className="pocket-ledger-date-year num">{yearStr}</span>
          </div>
        </div>
      </td>

      <td className="pocket-ledger-col-category">
        <span
          className="pocket-ledger-category-dot"
          style={{ background: catColor }}
        />
        <span>{item.cat || item.category}</span>
      </td>

      <td className="pocket-ledger-col-desc">
        <div className="pocket-ledger-desc-wrap">
          <span className="pocket-ledger-desc-title">
            {item.note || item.notes || item.title || '—'}
          </span>
        </div>
      </td>

      <td className="pocket-ledger-col-wallet">
        <span className="pocket-ledger-wallet-tag">
          {sourceWallet?.name || item.wallet_name || item.payment_method || 'Default'}
          {isTransfer && destWallet && ` → ${destWallet.name}`}
        </span>
      </td>

      <td className="pocket-ledger-col-amount pocket-ledger-align-right">
        <b
          style={{
            color: isIncome
              ? 'var(--pocket-accent, #10b981)'
              : isTransfer
              ? 'var(--pocket-soft-blue, #6366f1)'
              : 'var(--pocket-ink)',
          }}
        >
          {isIncome ? '+' : ''}
          {money(item.amt || item.amount)}
        </b>
      </td>

      <td className="pocket-ledger-col-actions pocket-ledger-align-right">
        <button
          type="button"
          className="pocket-ledger-ghost-button"
          onClick={() => onEdit && onEdit(item)}
        >
          Edit
        </button>{' '}
        <button
          type="button"
          className="pocket-ledger-ghost-button"
          onClick={() => onDelete && onDelete(item.id)}
          style={{ color: 'var(--pocket-out)' }}
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default TransactionTableRow
