import React, { useState, useMemo } from 'react'
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

    const initBal = parseFloat(initialBalance) || 0
    try {
      if (editingWallet) {
        await onUpdateWallet(editingWallet.id, {
          name: name.trim(),
          wallet_type: walletType,
          initial_balance: initBal,
          color,
        })
      } else {
        await onAddWallet({
          name: name.trim(),
          wallet_type: walletType,
          initial_balance: initBal,
          color,
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
    <section className="view on wallets-view" id="v-wallets" aria-label="Wallets and Accounts">
      {/* Top Header Bar */}
      <div className="wallets-top-bar">
        <div className="wallets-header-info">
          <h2>Wallets & Accounts</h2>
          <p>
            Track bank accounts, UPI wallets, and cash. All income and expenses calculate against selected wallets.
          </p>
        </div>
        <button
          type="button"
          className="primary"
          id="btn-add-wallet"
          onClick={openAddModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span aria-hidden="true">+</span>
          Add Account
        </button>
      </div>

      {/* KPI Cards */}
      <div className="wallets-kpis">
        <div className="card kpi">
          <span>Total Balance</span>
          <b className={totalBalance >= 0 ? 'pos' : 'neg'}>
            {money(totalBalance, currency)}
          </b>
        </div>
        <div className="card kpi">
          <span>Bank Accounts</span>
          <b>{money(bankTotal, currency)}</b>
        </div>
        <div className="card kpi">
          <span>UPI & Digital</span>
          <b>{money(digitalTotal, currency)}</b>
        </div>
        <div className="card kpi">
          <span>Cash</span>
          <b>{money(cashTotal, currency)}</b>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      {wallets.length === 0 ? (
        <div className="card empty">
          <b>No wallets found</b>
          Create your first bank account or wallet using the <b>+ Add Account</b> button above.
        </div>
      ) : (
        <div className="wallets-grid">
          {wallets.map((w) => {
            const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
            const typeObj = WALLET_TYPES.find((t) => t.id === (w.wallet_type || 'BANK')) || {
              label: w.wallet_type || 'Account',
            }

            return (
              <div key={w.id} className="wallet-tile" style={{ borderTop: `4px solid ${w.color || '#10b981'}` }}>
                <div className="wallet-tile-header">
                  <div className="wallet-tile-name-group">
                    <span className="wallet-color-dot" style={{ background: w.color || '#10b981' }}></span>
                    <span className="wallet-tile-name" title={w.name}>
                      {w.name}
                    </span>
                  </div>
                  <span className="wallet-badge">{typeObj.label}</span>
                </div>

                <div className="wallet-balance-box">
                  <span className="wallet-balance-label">Current Balance</span>
                  <div className={`wallet-balance-value ${bal >= 0 ? 'pos' : 'neg'}`}>
                    {money(bal, currency)}
                  </div>
                </div>

                <div className="wallet-tile-meta">
                  <span>Initial: {money(Number(w.initial_balance || 0), currency)}</span>
                  <span>ID: #{w.id}</span>
                </div>

                <div className="wallet-tile-actions">
                  <button
                    type="button"
                    className="wallet-btn"
                    onClick={() => openEditModal(w)}
                    aria-label={`Edit ${w.name}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="wallet-btn delete"
                    onClick={() => setDeletingId(w.id)}
                    aria-label={`Delete ${w.name}`}
                  >
                    🗑️ Delete
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
                  onChange={(e) => setName(e.target.value)}
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
