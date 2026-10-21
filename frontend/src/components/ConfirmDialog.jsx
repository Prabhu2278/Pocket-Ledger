import React from 'react'

export function ConfirmDialog({
  isOpen,
  title = 'Delete this expense?',
  message = 'This will remove the transaction from your ledger.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div
      className="pocket-ledger-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        className="pocket-ledger-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p style={{ margin: '8px 0 20px', color: 'var(--pocket-muted)' }}>
          {message}
        </p>

        <div className="pocket-ledger-dialog-actions">
          <button
            type="button"
            className="pocket-ledger-ghost-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="pocket-ledger-primary-button"
            onClick={onConfirm}
            style={isDanger ? { background: 'var(--pocket-out)' } : undefined}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
