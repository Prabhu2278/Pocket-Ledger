import React, { useState } from 'react'
import { money } from '../../utils/formatCurrency'

export function BudgetConfirmModal({ isOpen, currentBudget, onClose, onSave }) {
  const [target, setTarget] = useState(String(currentBudget || ''))

  if (!isOpen) return null

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
            <label className="pocket-field-label">Target Amount (₹)</label>
            <input
              type="number"
              className="pocket-ledger-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 50000"
              required
            />
          </div>
          <div className="pocket-ledger-dialog-actions">
            <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="pocket-ledger-btn-primary">Save Target</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BudgetConfirmModal
