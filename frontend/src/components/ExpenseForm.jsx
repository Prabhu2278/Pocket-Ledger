import React from 'react'
import { CATEGORIES } from '../constants/categories'
import { CURRENCY_CONFIGS } from '../utils/formatCurrency'

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
  currency = 'INR',
  expenseCategories = [],
  categories = [],
}) {
  if (!dialogOpen) return null

  const isEditing = editingId !== null
  const currCode = (currency || 'INR').toUpperCase()
  const currSymbol = CURRENCY_CONFIGS[currCode]?.symbol || '₹'

  // Derive categories: use props if available, otherwise fallback
  const availableCats = (expenseCategories.length > 0
    ? expenseCategories.map((c) => c.name)
    : categories.filter((c) => c.type === 'expense').map((c) => c.name)) || []
  
  const displayCats = availableCats.length > 0 ? availableCats : CATEGORIES.map((c) => c[0])

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dtitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDialogOpen(false)
      }}
    >
      <div className="dialog-content">
        <form className="f" onSubmit={saveExpense} noValidate>
          <h2 id="dtitle">{isEditing ? 'Edit expense' : 'Add expense'}</h2>

          <label>
            Amount
            <input
              className="amount"
              id="amt"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={`${currSymbol}0`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>

          <div className="chips" role="group" aria-label="Category">
            {displayCats.map((catName) => (
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
            Note
            <input
              id="note"
              type="text"
              maxLength={60}
              placeholder="What was it for? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label>
            Date
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <p className="err" id="err" role="alert">
            {formError}
          </p>

          <div className="btns">
            <button
              type="button"
              className="ghost"
              id="cancel"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button className="primary" id="save" type="submit">
              {isEditing ? 'Save changes' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm
