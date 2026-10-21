import React from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'

export function TransactionForm({
  dialogOpen,
  setDialogOpen,
  editingId,
  type = 'expense',
  setType,
  amount,
  setAmount,
  category,
  setCategory,
  note,
  setNote,
  date,
  setDate,
  formError,
  saveTransaction,
}) {
  if (!dialogOpen) return null

  const isEditing = editingId !== null
  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="txn-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDialogOpen(false)
      }}
    >
      <div className="dialog-content">
        <form className="f" onSubmit={saveTransaction} noValidate>
          <h2 id="txn-dialog-title">
            {isEditing ? `Edit ${type}` : 'Add transaction'}
          </h2>

          {/* Type Selector (only shown when adding new or can be toggled) */}
          {!isEditing && (
            <div
              className="chips"
              role="radiogroup"
              aria-label="Transaction Type"
              style={{ marginBottom: '8px' }}
            >
              <button
                type="button"
                className="chip"
                aria-pressed={type === 'expense'}
                onClick={() => {
                  setType('expense')
                  setCategory('Food')
                }}
              >
                Expense
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={type === 'income'}
                onClick={() => {
                  setType('income')
                  setCategory('Salary')
                }}
              >
                Income
              </button>
            </div>
          )}

          <label>
            Amount
            <input
              className="amount"
              id="txn-amt"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="₹0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>

          <label style={{ margin: '6px 0 2px', fontSize: '13px', fontWeight: 600 }}>Category</label>
          <div className="chips" role="group" aria-label="Category Selection">
            {activeCategories.map(([catName]) => (
              <button
                key={catName}
                type="button"
                className="chip"
                aria-pressed={category === catName}
                onClick={() => setCategory(catName)}
              >
                {catName}
              </button>
            ))}
          </div>

          <label>
            Description / Note
            <input
              id="txn-note"
              type="text"
              maxLength={80}
              placeholder={type === 'income' ? 'e.g. Monthly salary, Client retainer' : 'What was it for? (optional)'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label>
            Date
            <input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {formError && (
            <p className="err" id="txn-err" role="alert">
              {formError}
            </p>
          )}

          <div className="btns">
            <button
              type="button"
              className="ghost"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button className="primary" type="submit">
              {isEditing ? 'Save changes' : `Save ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionForm
