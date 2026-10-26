import React, { useState, useMemo, useEffect } from 'react'
import { money } from '../utils/formatCurrency'
import '../styles/pages/Wallets.css'

const WALLET_TYPES = [
  { id: 'BANK', label: 'Bank Account' },
  { id: 'WALLET', label: 'Digital / UPI' },
  { id: 'CASH', label: 'Cash' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
]

const WALLET_PALETTE = [
  '#10b981', // Emerald
  '#3b82f6', // Sapphire Blue
  '#8b5cf6', // Violet
  '#ec4899', // Rose Pink
  '#f59e0b', // Amber Orange
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Coral Orange
  '#a855f7', // Purple
  '#e11d48', // Ruby
  '#84cc16', // Lime
  '#0284c7', // Sky Blue
  '#d946ef', // Fuchsia
  '#22c55e', // Green
  '#eab308', // Sunflower
  '#64748b', // Slate
  '#4f46e5', // Deep Indigo
  '#059669', // Pine Green
  '#2563eb', // Royal Blue
  '#db2777', // Magenta Pink
  '#ea580c', // Bright Rust
  '#7c3aed', // Royal Violet
  '#0891b2', // Deep Ocean Cyan
]

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function getUniqueWalletColor(existingWallets = []) {
  const used = new Set(
    existingWallets
      .map((w) => (w.color || '').toLowerCase().trim())
      .filter(Boolean)
  )

  // 1. Filter out colors already in use by another wallet
  const unusedPalette = WALLET_PALETTE.filter(
    (c) => !used.has(c.toLowerCase())
  )

  if (unusedPalette.length > 0) {
    const idx = Math.floor(Math.random() * unusedPalette.length)
    return unusedPalette[idx]
  }

  // 2. If all curated colors are in use, generate a random vibrant HSL color that is not used
  for (let attempt = 0; attempt < 50; attempt++) {
    const randomHue = Math.floor(Math.random() * 360)
    const genColor = hslToHex(randomHue, 72, 52)
    if (!used.has(genColor.toLowerCase())) {
      return genColor
    }
  }

  return '#4f46e5'
}

export function Wallets({
  wallets = [],
  currency = 'INR',
  onAddWallet,
  onUpdateWallet,
  onDeleteWallet,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Scroll Lock: disable background/outside scrolling when modal is open
  useEffect(() => {
    if (modalOpen || deletingId) {
      document.body.classList.add('modal-open')
      document.documentElement.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [modalOpen, deletingId])

  // Form states
  const [name, setName] = useState('')
  const [walletType, setWalletType] = useState('BANK')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState('#10b981')
  const [error, setError] = useState('')

  // Compute overall KPI aggregates
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const bankTotal = useMemo(() => {
    return wallets
      .filter((w) => (w.wallet_type || 'BANK').toUpperCase() === 'BANK')
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const digitalTotal = useMemo(() => {
    return wallets
      .filter((w) => {
        const t = (w.wallet_type || '').toUpperCase()
        return t === 'WALLET' || t === 'UPI' || t === 'DIGITAL'
      })
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const cashTotal = useMemo(() => {
    return wallets
      .filter((w) => (w.wallet_type || '').toUpperCase() === 'CASH')
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const openAddModal = () => {
    setEditingWallet(null)
    setName('')
    setWalletType('BANK')
    setInitialBalance('')
    setColor(getUniqueWalletColor(wallets))
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (w) => {
    setEditingWallet(w)
    setName(w.name || '')
    setWalletType(w.wallet_type || 'BANK')
    setInitialBalance(String(w.initial_balance ?? 0))
    setColor(w.color || getUniqueWalletColor(wallets))
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter an account name.')
      return
    }

    const initBal = parseFloat(initialBalance) || 0
    try {
      if (editingWallet) {
        await onUpdateWallet(editingWallet.id, {
          name: name.trim(),
          wallet_type: walletType,
          initial_balance: initBal,
          color: editingWallet.color || color || getUniqueWalletColor(wallets),
        })
      } else {
        const assignedColor = color || getUniqueWalletColor(wallets)
        await onAddWallet({
          name: name.trim(),
          wallet_type: walletType,
          initial_balance: initBal,
          color: assignedColor,
        })
      }
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save account.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try {
      await onDeleteWallet(deletingId)
      setDeletingId(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <section className="view on wallets-view pl-wallets-page" id="v-wallets" aria-label="Wallets and Accounts">
      {/* Top Header Bar */}
      <div className="pl-wallets-header">
        <div className="pl-wallets-header-info">
          <h2 className="pl-wallets-title">Wallet Overview</h2>
          <p className="pl-wallets-desc">
            Track bank accounts, UPI wallets, and cash. All income and expenses calculate against selected wallets.
          </p>
        </div>
        <button
          type="button"
          className="pl-wallets-add-btn"
          id="btn-add-wallet"
          onClick={openAddModal}
        >
          <span aria-hidden="true" className="pl-wallets-add-btn-plus">+</span>
          <span>Add Wallet</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards (Row 1) */}
      <div className="pl-wallets-summary-grid">
        <div className="pl-wallets-summary-card total" style={{ '--kpi-accent': '#10b981' }}>
          <div className="pl-wallets-summary-top">
            <span className="pl-wallets-summary-label">TOTAL BALANCE</span>
            <div className="pl-wallets-summary-badge total" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
          <b className={`pl-wallets-summary-value ${totalBalance >= 0 ? 'pos' : 'neg'}`}>
            {money(totalBalance, currency)}
          </b>
          <div className="pl-wallets-summary-sub">
            <span className="pl-wallets-summary-pill total">Combined</span>
            <span>Across all accounts</span>
          </div>
        </div>

        <div className="pl-wallets-summary-card bank" style={{ '--kpi-accent': '#3b82f6' }}>
          <div className="pl-wallets-summary-top">
            <span className="pl-wallets-summary-label">BANK ACCOUNTS</span>
            <div className="pl-wallets-summary-badge bank" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M3 10h18" />
                <path d="M5 6l7-3 7 3" />
                <path d="M4 10v11" />
                <path d="M20 10v11" />
                <path d="M8 14v4" />
                <path d="M12 14v4" />
                <path d="M16 14v4" />
              </svg>
            </div>
          </div>
          <b className="pl-wallets-summary-value">{money(bankTotal, currency)}</b>
          <div className="pl-wallets-summary-sub">
            <span className="pl-wallets-summary-pill bank">Bank</span>
            <span>Checking & savings</span>
          </div>
        </div>

        <div className="pl-wallets-summary-card digital" style={{ '--kpi-accent': '#8b5cf6' }}>
          <div className="pl-wallets-summary-top">
            <span className="pl-wallets-summary-label">UPI & DIGITAL</span>
            <div className="pl-wallets-summary-badge digital" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
          </div>
          <b className="pl-wallets-summary-value">{money(digitalTotal, currency)}</b>
          <div className="pl-wallets-summary-sub">
            <span className="pl-wallets-summary-pill digital">Digital</span>
            <span>UPI & online wallets</span>
          </div>
        </div>

        <div className="pl-wallets-summary-card cash" style={{ '--kpi-accent': '#f59e0b' }}>
          <div className="pl-wallets-summary-top">
            <span className="pl-wallets-summary-label">CASH</span>
            <div className="pl-wallets-summary-badge cash" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
          </div>
          <b className="pl-wallets-summary-value">{money(cashTotal, currency)}</b>
          <div className="pl-wallets-summary-sub">
            <span className="pl-wallets-summary-pill cash">Cash</span>
            <span>Physical cash in hand</span>
          </div>
        </div>
      </div>

      {/* Section Header: Linked Accounts */}
      <div className="pl-wallets-section-header">
        <div className="pl-wallets-section-title-wrap">
          <h3 className="pl-wallets-section-title">Linked Wallets</h3>
          <span className="pl-wallets-section-badge">{wallets.length} active</span>
        </div>
      </div>

      {/* Wallet Cards Grid (Row 2) */}
      {wallets.length === 0 ? (
        <div className="card empty">
          <b>No wallets found</b>
          Create your first bank account or wallet using the <b>+ Add Wallet</b> button above.
        </div>
      ) : (
        <div className="pl-wallets-grid">
          {wallets.map((w) => {
            const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
            const typeObj = WALLET_TYPES.find((t) => t.id === (w.wallet_type || 'BANK')) || {
              label: w.wallet_type || 'Account',
            }
            const typeKey = (w.wallet_type || 'BANK').toLowerCase()
            const badgeClass = typeKey.includes('bank')
              ? 'bank'
              : typeKey.includes('cash')
                ? 'cash'
                : typeKey.includes('credit')
                  ? 'credit'
                  : 'digital'
            const accentColor = w.color || '#10b981'

            return (
              <div key={w.id} className="pl-wallets-card" style={{ '--wallet-border-color': accentColor }}>
                <div
                  className="pl-wallets-card-ambient"
                  style={{
                    background: `radial-gradient(circle at 15% 20%, ${accentColor}18 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />
                <div className="pl-wallets-card-header">
                  <div className="pl-wallets-card-name-group">
                    <span
                      className="pl-wallets-card-icon"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                        boxShadow: `0 4px 10px ${accentColor}40`,
                      }}
                      aria-hidden="true"
                    >
                      {typeKey.includes('bank') ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v4" /><path d="M12 14v4" /><path d="M16 14v4" />
                        </svg>
                      ) : typeKey.includes('cash') ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <span className="pl-wallets-card-name" title={w.name}>
                        {w.name}
                      </span>
                      <span className="pl-wallets-card-sub">{typeObj.label}</span>
                    </div>
                  </div>
                  <span className={`pl-wallets-type-badge ${badgeClass}`}>{typeObj.label}</span>
                </div>

                <div className="pl-wallets-balance-box">
                  <span className="pl-wallets-balance-label">CURRENT BALANCE</span>
                  <div className={`pl-wallets-balance-value ${bal >= 0 ? 'pos' : 'neg'}`}>
                    {money(bal, currency)}
                  </div>
                </div>

                <div className="pl-wallets-meta-row">
                  <span>Initial: {money(Number(w.initial_balance || 0), currency)}</span>
                  <span>ID: #{w.id}</span>
                </div>

                <div className="pl-wallets-actions">
                  <button
                    type="button"
                    className="pl-wallets-action-btn edit"
                    onClick={() => openEditModal(w)}
                    aria-label={`Edit ${w.name}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="pl-wallets-action-btn delete"
                    onClick={() => setDeletingId(w.id)}
                    aria-label={`Delete ${w.name}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Wallet Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="dialog-content wallet-dialog-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="wallet-modal-header">
              <div className="wallet-modal-title-wrap">
                <div className="wallet-modal-icon-badge" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <h2 id="wallet-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    {editingWallet ? 'Edit Account' : 'Add New Account'}
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--pl-text-muted)' }}>
                    {editingWallet ? 'Update account details and balance' : 'Create a new wallet or bank account'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--pl-radius-md)',
                  color: 'var(--pl-text-muted)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Account Name */}
              <div className="wallet-field-group">
                <label htmlFor="wallet-name-input" className="wallet-field-label">
                  Account Name <span style={{ color: 'var(--pl-color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="wallet-name-input"
                  className="wallet-form-input"
                  required
                  placeholder="e.g. HDFC Bank, GPay, Cash in Hand"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Account Type */}
              <div className="wallet-field-group">
                <label className="wallet-field-label">
                  Account Type
                </label>
                <div className="wallet-type-grid" role="radiogroup" aria-label="Account Type">
                  {WALLET_TYPES.map((t) => {
                    const isSelected = walletType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`wallet-type-btn ${isSelected ? 'active' : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => setWalletType(t.id)}
                      >
                        <span className="wallet-type-btn-icon" aria-hidden="true">
                          {t.id === 'BANK' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
                            </svg>
                          )}
                          {t.id === 'WALLET' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                          )}
                          {t.id === 'CASH' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="2" />
                              <circle cx="12" cy="12" r="2" />
                              <path d="M6 12h.01M18 12h.01" />
                            </svg>
                          )}
                          {t.id === 'CREDIT_CARD' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                              <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                          )}
                        </span>
                        <span className="wallet-type-btn-label">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Initial Starting Balance */}
              <div className="wallet-field-group">
                <label htmlFor="wallet-balance-input" className="wallet-field-label">
                  Initial Starting Balance ({currency})
                </label>
                <div className="wallet-balance-input-wrap">
                  <span className="wallet-currency-badge" aria-hidden="true">
                    {currency === 'INR' ? '₹' : currency}
                  </span>
                  <input
                    type="number"
                    id="wallet-balance-input"
                    className="wallet-form-input wallet-balance-input"
                    step="0.01"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="wallet-form-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Form Buttons */}
              <div className="wallet-modal-actions">
                <button
                  type="button"
                  className="wallet-btn-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wallet-btn-submit">
                  {editingWallet ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (() => {
        const targetWallet = wallets.find((w) => String(w.id) === String(deletingId))
        return (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setDeletingId(null)}
          >
            <div className="dialog-content wallet-dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="f">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--pl-text-primary, #1e293b)' }}>
                      Delete Wallet?
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--pl-text-muted, #64748b)' }}>
                      Account: <strong>{targetWallet?.name || 'Selected Wallet'}</strong>
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  margin: '12px 0 18px'
                }}>
                  <strong>⚠️ Warning:</strong> Deleting this wallet will <strong>permanently delete all associated transactions</strong> (expenses, incomes, and transfers). This action cannot be undone.
                </div>

                <div className="btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setDeletingId(null)}
                    style={{ padding: '8px 16px', fontWeight: 600 }}
                  >
                    No, Cancel
                  </button>
                  <button
                    type="button"
                    className="primary"
                    style={{
                      background: 'var(--pl-color-danger, #ef4444)',
                      borderColor: 'var(--pl-color-danger, #ef4444)',
                      color: '#ffffff',
                      padding: '8px 18px',
                      fontWeight: 600,
                    }}
                    onClick={handleConfirmDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}

export default Wallets
