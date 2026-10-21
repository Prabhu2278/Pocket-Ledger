import React from 'react'
import { useApp } from '@/context/AppContext'

/**
 * LogoutConfirmModal
 * Prompts user for confirmation before terminating active session.
 */
export function LogoutConfirmModal() {
  const { currentUser, isLogoutConfirmOpen, closeLogoutConfirm, handleLogout } = useApp()

  if (!isLogoutConfirmOpen || !currentUser) return null

  const initial = (currentUser.username || 'U')[0].toUpperCase()

  return (
    <div
      className="pocket-ledger-dialog-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeLogoutConfirm()
        }
      }}
    >
      <div
        className="pocket-ledger-dialog pocket-ledger-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-desc"
      >
        <div className="pocket-ledger-confirm-header">
          <div
            className="pocket-ledger-confirm-icon"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.28)',
            }}
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div className="pocket-ledger-confirm-text">
            <h3 id="logout-confirm-title">Confirm Sign Out</h3>
            <p id="logout-confirm-desc">
              Are you sure you want to log out of Pocket Ledger? You will need to sign back in to access your transactions.
            </p>
          </div>
        </div>

        <div className="pocket-ledger-confirm-preview-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '15px',
                flexShrink: 0,
              }}
            >
              {initial}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--pocket-ink)' }}>
                {currentUser.username}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--pocket-muted)' }}>
                Active Session
              </span>
            </div>
          </div>
        </div>

        <div className="pocket-ledger-confirm-footer">
          <button
            type="button"
            className="pocket-ledger-confirm-btn-cancel"
            onClick={closeLogoutConfirm}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pocket-ledger-confirm-btn-delete"
            onClick={handleLogout}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
