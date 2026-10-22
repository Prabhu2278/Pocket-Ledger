import React, { useState, useEffect } from 'react'
import { CustomDropdown } from '../../ui/CustomDropdown/CustomDropdown'

const WALLET_TYPE_OPTIONS = [
  { value: 'BANK', label: 'Bank Account' },
  { value: 'WALLET', label: 'UPI / Digital Wallet' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
]

export function EditWalletModal({ isOpen, wallet, onClose, onSave }) {
  const [name, setName] = useState('')
  const [walletType, setWalletType] = useState('BANK')

  useEffect(() => {
    if (wallet) {
      setName(wallet.name || '')
      setWalletType(wallet.wallet_type || 'BANK')
    }
  }, [wallet])

  if (!isOpen || !wallet) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(wallet.id, { name: name.trim(), wallet_type: walletType })
    onClose()
  }

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Edit Account</h2>
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
              required
            />
          </div>
          <div className="pocket-form-field">
            <label className="pocket-field-label">Account Type</label>
            <CustomDropdown
              id="edit-wallet-type-select"
              value={walletType}
              onChange={(val) => setWalletType(val)}
              options={WALLET_TYPE_OPTIONS}
            />
          </div>
          <div className="pocket-ledger-dialog-actions">
            <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pocket-ledger-btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditWalletModal
