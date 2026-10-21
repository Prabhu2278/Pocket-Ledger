import React from 'react'

export function Toast({ toast, undoDelete }) {
  if (!toast || toast.hidden) return null

  return (
    <div
      className="pocket-ledger-toast"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '12px 20px',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <span>{toast.message}</span>
      {toast.undo && undoDelete && (
        <button
          type="button"
          onClick={undoDelete}
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Undo
        </button>
      )}
    </div>
  )
}

export default Toast
