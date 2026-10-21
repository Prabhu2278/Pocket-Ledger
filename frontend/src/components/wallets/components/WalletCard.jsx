import React from 'react'
import { money } from '../../../utils/formatCurrency'

export function WalletCard({ wallet, isSelected, onClick, onEdit, onDelete }) {
  const balance = wallet.balance ?? wallet.initial_balance ?? 0

  return (
    <div
      className={`pocket-wallet-card ${isSelected ? 'pocket-wallet-selected' : ''}`}
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${wallet.color || '#10b981'}`,
        cursor: 'pointer',
      }}
    >
      <div className="pocket-wallet-header">
        <span className="pocket-wallet-name">{wallet.name}</span>
        <span className="pocket-wallet-type-badge">{wallet.wallet_type || 'BANK'}</span>
      </div>
      <div className="pocket-wallet-balance">{money(balance)}</div>
      <div className="pocket-wallet-actions" onClick={(e) => e.stopPropagation()}>
        {onEdit && (
          <button type="button" className="pocket-wallet-action-btn" onClick={() => onEdit(wallet)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button type="button" className="pocket-wallet-action-btn" onClick={() => onDelete(wallet.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default WalletCard
