import React from 'react'

export function TransactionPagination({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
      <button
        type="button"
        className="pocket-ledger-btn-cancel"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '6px 12px', fontSize: '12px' }}
      >
        Previous
      </button>
      <span style={{ fontSize: '13px', color: 'var(--pocket-muted)' }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        className="pocket-ledger-btn-cancel"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '6px 12px', fontSize: '12px' }}
      >
        Next
      </button>
    </div>
  )
}

export default TransactionPagination
