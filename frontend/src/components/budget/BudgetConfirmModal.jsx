import React, { useState } from 'react'
import { money, CURRENCY_CONFIGS } from '../../utils/formatCurrency'

export function BudgetConfirmModal({ isOpen, currentBudget, onClose, onSave, currency = 'INR' }) {
  const [target, setTarget] = useState(String(currentBudget || ''))

  if (!isOpen) return null

  const currCode = (currency || 'INR').toUpperCase()
  const currSymbol = CURRENCY_CONFIGS[currCode]?.symbol || '₹'

  const handleSave = (e) => {
    e.preventDefault()
    const val = parseFloat(target)
    if (val > 0) {
      onSave(val)
      onClose()
    }
  }

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Set Monthly Budget</h2>
          <button type="button" className="pocket-ledger-dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} className="pocket-ledger-form">
          <div className="pocket-form-field">
            <label className="pocket-field-label">Target Amount ({currSymbol})</label>
            <input
              type="number"
              className="pocket-ledger-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 50000"
              required
            />
          </div>
          <p className="pocket-ledger-desc" style={{ fontSize: '13px', margin: '4px 0 16px' }}>
            Current target is {money(currentBudget, currency)}
          </p>
          <div className="pocket-ledger-dialog-actions">
            <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pocket-ledger-btn-primary">Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BudgetConfirmModal
