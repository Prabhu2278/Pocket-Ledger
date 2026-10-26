import React from 'react'

export function Sidebar({
  page,
  user = null,
  onLogout,
}) {
  const isTxnActive = page === 'transactions' || page === 'expenses' || page === 'income'

  const displayName = user
    ? user.full_name || user.name || (user.email ? user.email.split('@')[0] : 'User')
    : ''
  const firstName = displayName.trim().split(/\s+/)[0] || 'U'
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : 'U'

  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-icon-box">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h5" />
          </svg>
        </div>
        <div className="brand-text-col">
          <span className="brand-title">Pocket Ledger</span>
          <span className="brand-sub">PRO V2.4</span>
        </div>
      </div>

      <nav aria-label="Modules">
        <a
          href="#/dashboard"
          id="n-dashboard"
          aria-current={page === 'dashboard' || page === 'insights' ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </a>

        <a
          href="#/transactions"
          id="n-transactions"
          aria-current={isTxnActive ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          Transactions
        </a>

        <a
          href="#/wallets"
          id="n-wallets"
          aria-current={page === 'wallets' ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
          </svg>
          Wallets
        </a>

        <a
          href="#/settings"
          id="n-settings"
          aria-current={page === 'settings' ? 'page' : undefined}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </a>
      </nav>

      {user ? (
        <div className="side-user">
          <a
            href="#/settings?tab=profile"
            className="side-user-profile"
            id="side-profile-btn"
            title="Profile settings"
            aria-label={`Profile settings for ${displayName}`}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('settings-tab-change', { detail: 'profile' }))
              if (window.location.hash !== '#/settings?tab=profile') {
                window.location.hash = '#/settings?tab=profile'
              }
            }}
          >
            <div className="side-user-avatar" aria-label={`Profile: ${displayName}`}>
              {userInitial}
            </div>
            <div className="side-user-info">
              <div className="side-user-name" title={displayName}>{displayName}</div>
            </div>
          </a>
          <button
            type="button"
            className="side-logout-btn"
            onClick={onLogout}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="side-user">
          <a
            href="#/login"
            className="side-user-profile"
            id="side-profile-btn"
            title="Sign in"
            aria-label="Sign in"
          >
            <div className="side-user-avatar side-user-avatar-guest" aria-label="Guest session">
              G
            </div>
            <div className="side-user-info">
              <div className="side-user-name">Guest session</div>
            </div>
          </a>
          <a
            href="#/login"
            className="side-logout-btn"
            style={{ textDecoration: 'none', color: 'var(--pl-color-primary)' }}
          >
            Sign in
          </a>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
