import React from 'react'

export function DeleteWalletModal({ isOpen, walletId, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Delete Account?</h2>
          <button type="button" className="pocket-ledger-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="pocket-ledger-dialog-body" style={{ padding: '16px 0', color: 'var(--pocket-muted)' }}>
          Are you sure you want to remove this account? Associated transactions will remain in your history.
        </div>
        <div className="pocket-ledger-dialog-actions">
          <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
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
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteWalletModal
