import React, { useState, useMemo, useEffect } from 'react'
import { money } from '../utils/formatCurrency'
import './Wallets.css'

const WALLET_TYPES = [
  { id: 'BANK', label: 'Bank Account' },
  { id: 'WALLET', label: 'Digital / UPI' },
  { id: 'CASH', label: 'Cash' },
  { id: 'CREDIT_CARD', label: 'Credit Card' },
]

const COLOR_OPTIONS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b']

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

  // Helper to reliably identify Cash / Cash in Hand accounts
  const isCashWallet = (w) => {
    const t = (w.wallet_type || '').toUpperCase()
    const n = (w.name || '').toLowerCase()
    return t === 'CASH' || n === 'cash' || n.includes('cash in hand') || n.includes('cash')
  }

  // Compute overall KPI aggregates
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const bankTotal = useMemo(() => {
    return wallets
      .filter((w) => !isCashWallet(w) && (w.wallet_type || 'BANK').toUpperCase() === 'BANK')
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const digitalTotal = useMemo(() => {
    return wallets
      .filter((w) => {
        if (isCashWallet(w)) return false
        const t = (w.wallet_type || '').toUpperCase()
        return t === 'WALLET' || t === 'UPI' || t === 'DIGITAL'
      })
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const cashTotal = useMemo(() => {
    return wallets
      .filter((w) => isCashWallet(w))
      .reduce((sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0), 0)
  }, [wallets])

  const openAddModal = () => {
    setEditingWallet(null)
    setName('')
    setWalletType('BANK')
    setInitialBalance('')
    setColor('#10b981')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (w) => {
    setEditingWallet(w)
    setName(w.name || '')
    setWalletType(w.wallet_type || 'BANK')
    setInitialBalance(String(w.initial_balance ?? 0))
    setColor(w.color || '#10b981')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter an account name.')
      return
    }

    const trimmedName = name.trim()
    let finalType = walletType
    if (trimmedName.toLowerCase().includes('cash') && finalType === 'BANK') {
      finalType = 'CASH'
    }

    const initBal = parseFloat(initialBalance) || 0
    try {
      if (editingWallet) {
        await onUpdateWallet(editingWallet.id, {
          name: trimmedName,
          wallet_type: finalType,
          initial_balance: initBal,
          color,
        })
      } else {
        await onAddWallet({
          name: trimmedName,
          wallet_type: finalType,
          initial_balance: initBal,
          color: finalType === 'CASH' && color === '#10b981' ? '#f59e0b' : color,
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
          <h2 className="pl-wallets-title">Wallets & Accounts</h2>
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
          <span>Add Account</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards (Row 1) */}
      <div className="pl-wallets-summary-grid">
        <div className="pl-wallets-summary-card" style={{ '--kpi-accent': '#10b981' }}>
          <span className="pl-wallets-summary-label">TOTAL BALANCE</span>
          <b className={`pl-wallets-summary-value ${totalBalance >= 0 ? 'pos' : 'neg'}`}>
            {money(totalBalance, currency)}
          </b>
        </div>
        <div className="pl-wallets-summary-card" style={{ '--kpi-accent': '#3b82f6' }}>
          <span className="pl-wallets-summary-label">BANK ACCOUNTS</span>
          <b className="pl-wallets-summary-value">{money(bankTotal, currency)}</b>
        </div>
        <div className="pl-wallets-summary-card" style={{ '--kpi-accent': '#8b5cf6' }}>
          <span className="pl-wallets-summary-label">UPI & DIGITAL</span>
          <b className="pl-wallets-summary-value">{money(digitalTotal, currency)}</b>
        </div>
        <div className="pl-wallets-summary-card" style={{ '--kpi-accent': '#f59e0b' }}>
          <span className="pl-wallets-summary-label">CASH</span>
          <b className="pl-wallets-summary-value">{money(cashTotal, currency)}</b>
        </div>
      </div>

      {/* Section Header: My Wallets & Accounts */}
      <div className="pl-wallets-section-header">
        <div className="pl-wallets-section-title-wrap">
          <h3 className="pl-wallets-section-title">My Wallets & Accounts</h3>
          <span className="pl-wallets-section-badge">{wallets.length} active</span>
        </div>
      </div>

      {/* Wallet Cards Grid (Row 2) */}
      {wallets.length === 0 ? (
        <div className="card empty">
          <b>No wallets found</b>
          Create your first bank account or wallet using the <b>+ Add Account</b> button above.
        </div>
      ) : (
        <div className="pl-wallets-grid">
          {wallets.map((w) => {
            const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
            const isCash = isCashWallet(w)
            const typeObj = isCash
              ? { id: 'CASH', label: 'Cash' }
              : WALLET_TYPES.find((t) => t.id === (w.wallet_type || 'BANK')) || {
                  label: w.wallet_type || 'Account',
                }
            const typeKey = isCash ? 'cash' : (w.wallet_type || 'BANK').toLowerCase()
            const badgeClass = isCash
              ? 'cash'
              : typeKey.includes('bank')
              ? 'bank'
              : typeKey.includes('credit')
              ? 'credit'
              : 'digital'

            return (
              <div key={w.id} className="pl-wallets-card" style={{ '--wallet-border-color': w.color || '#10b981' }}>
                <div className="pl-wallets-card-header">
                  <div className="pl-wallets-card-name-group">
                    <span className="pl-wallets-card-dot" style={{ background: w.color || '#10b981' }}></span>
                    <span className="pl-wallets-card-name" title={w.name}>
                      {w.name}
                    </span>
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="pl-wallets-action-btn delete"
                    onClick={() => setDeletingId(w.id)}
                    aria-label={`Delete ${w.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="dialog-content wallet-dialog-content">
            <form className="f" onSubmit={handleSubmit} noValidate>
              <h2>{editingWallet ? 'Edit Account' : 'Add New Account'}</h2>

              <label>
                Account Name
                <input
                  type="text"
                  id="wallet-name-input"
                  required
                  placeholder="e.g. HDFC Bank, GPay, Cash in Hand"
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value
                    setName(val)
                    if (!editingWallet && val.toLowerCase().includes('cash') && walletType === 'BANK') {
                      setWalletType('CASH')
                      setColor('#f59e0b')
                    }
                  }}
                  autoFocus
                />
              </label>

              <label style={{ margin: '6px 0 2px', fontSize: '13px', fontWeight: 600 }}>
                Account Type
              </label>
              <div className="wallet-type-chips" role="radiogroup" aria-label="Account Type">
                {WALLET_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="wallet-type-chip"
                    aria-pressed={walletType === t.id}
                    onClick={() => setWalletType(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label>
                Initial Starting Balance ({currency})
                <input
                  type="number"
                  id="wallet-balance-input"
                  step="0.01"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </label>

              <label style={{ margin: '6px 0 2px', fontSize: '13px', fontWeight: 600 }}>
                Accent Color
              </label>
              <div className="wallet-color-swatches" role="radiogroup" aria-label="Accent Color">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`wallet-color-swatch ${color === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>

              {error && (
                <p className="err" role="alert">
                  {error}
                </p>
              )}

              <div className="btns">
                <button type="button" className="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  {editingWallet ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeletingId(null)}
        >
          <div className="dialog-content wallet-dialog-content">
            <div className="f">
              <h2>Delete Account</h2>
              <p style={{ color: 'var(--pl-text-muted)', fontSize: '13px', margin: '4px 0 16px' }}>
                Are you sure you want to delete this account? Transactions linked to it may lose their wallet association.
              </p>
              <div className="btns">
                <button type="button" className="ghost" onClick={() => setDeletingId(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary"
                  style={{ background: 'var(--pl-color-danger)', borderColor: 'var(--pl-color-danger)' }}
                  onClick={handleConfirmDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Wallets
