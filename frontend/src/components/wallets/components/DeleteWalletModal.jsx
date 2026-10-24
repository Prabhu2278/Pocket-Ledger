import React from 'react'

export function DeleteWalletModal({ isOpen, walletId, walletName, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Delete Wallet & Transactions?</h2>
          <button type="button" className="pocket-ledger-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="pocket-ledger-dialog-body" style={{ padding: '14px 0', color: 'var(--pocket-muted)' }}>
          <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--pl-text-primary, #1e293b)' }}>
            Are you sure you want to delete <strong>{walletName ? `"${walletName}"` : 'this wallet'}</strong>?
          </p>
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#b91c1c',
            fontSize: '13px',
            lineHeight: '1.45'
          }}>
            ⚠️ <strong>Warning:</strong> All transactions (expenses, incomes, transfers) related to this wallet will also be <strong>permanently deleted</strong>. This cannot be undone.
          </div>
        </div>
        <div className="pocket-ledger-dialog-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>
            No, Cancel
          </button>
          <button
            type="button"
            className="pocket-ledger-btn-danger"
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => onConfirm(walletId)}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteWalletModal
