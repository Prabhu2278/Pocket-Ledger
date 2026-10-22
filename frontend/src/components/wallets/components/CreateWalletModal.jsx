import React, { useState, useEffect } from 'react'

export function CreateWalletModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  const [walletType, setWalletType] = useState('BANK')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState('#10b981')

  // Scroll Lock: disable background/outside scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
      document.documentElement.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      wallet_type: walletType,
      initial_balance: parseFloat(initialBalance) || 0,
      color,
    })
    setName('')
    setInitialBalance('')
    onClose()
  }

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Create New Account</h2>
          <button type="button" className="pocket-ledger-dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="pocket-ledger-form">
          <div className="pocket-form-field">
            <label className="pocket-field-label">Account Name</label>
            <input
              type="text"
              className="pocket-ledger-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Bank, GPay"
              required
            />
          </div>
          <div className="pocket-form-field">
            <label className="pocket-field-label">Account Type</label>
            <select
              className="pocket-ledger-select"
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
            >
              <option value="BANK">Bank Account</option>
              <option value="WALLET">UPI / Digital Wallet</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>
          <div className="pocket-form-field">
            <label className="pocket-field-label">Initial Balance (₹)</label>
            <input
              type="number"
              className="pocket-ledger-input"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="pocket-ledger-dialog-actions">
            <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pocket-ledger-btn-primary">Save Account</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWalletModal
