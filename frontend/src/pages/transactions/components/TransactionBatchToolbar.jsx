import React from 'react'

export function TransactionBatchToolbar({ selectedCount = 0, onDeleteSelected = () => {}, onClear = () => {} }) {
  if (selectedCount === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        marginBottom: '12px',
        background: 'var(--pocket-card)',
        border: '1px solid var(--pocket-line)',
        borderRadius: '10px',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedCount} item(s) selected</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={onDeleteSelected}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Delete Selected
        </button>
        <button
          type="button"
          className="pocket-ledger-btn-cancel"
          onClick={onClear}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Deselect All
        </button>
      </div>
    </div>
  )
}

export default TransactionBatchToolbar
