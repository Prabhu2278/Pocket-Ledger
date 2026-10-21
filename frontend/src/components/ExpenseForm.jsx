import React from 'react'
import { CATEGORIES } from '../hooks/useExpenses'

export function ExpenseForm({
  dialogOpen,
  setDialogOpen,
  editingId,
  amount,
  setAmount,
  category,
  setCategory,
  note,
  setNote,
  date,
  setDate,
  formError,
  saveExpense,
}) {
  if (!dialogOpen) return null

  return (
    <div
      className="pocket-ledger-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setDialogOpen(false)
        }
      }}
    >
      <section
        className="pocket-ledger-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pocket-ledger-dialog-title"
      >
        <form className="pocket-ledger-expense-form" onSubmit={saveExpense}>
          <h2 id="pocket-ledger-dialog-title">
            {editingId !== null ? 'Edit expense' : 'Add expense'}
          </h2>

          <label className="pocket-ledger-form-label">
            Amount
            <input
              className="pocket-ledger-amount-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="₹0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
              required
            />
          </label>

          <div
            className="pocket-ledger-form-categories"
            role="group"
            aria-label="Category"
          >
            {CATEGORIES.map(([name]) => (
              <button
                type="button"
                key={name}
                className="pocket-ledger-chip"
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="pocket-ledger-form-label">
            Note
            <input
              type="text"
              maxLength="60"
              placeholder="What was it for? (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <label className="pocket-ledger-form-label">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          {formError && (
            <div className="pocket-ledger-form-error">{formError}</div>
          )}

          <div className="pocket-ledger-dialog-actions">
            <button
              type="button"
              className="pocket-ledger-ghost-button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="pocket-ledger-primary-button"
            >
              {editingId !== null ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ExpenseForm
