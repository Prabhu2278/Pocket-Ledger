import React from 'react'
import { INCOME_CATEGORIES } from '../constants/categories'
import { CURRENCY_CONFIGS } from '../utils/formatCurrency'

export function IncomeForm({
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
  saveIncome,
  currency = 'INR',
  incomeCategories = [],
  categories = [],
}) {
  if (!dialogOpen) return null

  const isEditing = editingId !== null
  const currCode = (currency || 'INR').toUpperCase()
  const currSymbol = CURRENCY_CONFIGS[currCode]?.symbol || '₹'

  // Derive income categories
  const availableCats = (incomeCategories.length > 0
    ? incomeCategories.map((c) => c.name)
    : categories.filter((c) => c.type === 'income').map((c) => c.name)) || []
  
  const displayCats = availableCats.length > 0 ? availableCats : INCOME_CATEGORIES.map((c) => c[0])

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inc-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDialogOpen(false)
      }}
    >
      <div className="dialog-content">
        <form className="f" onSubmit={saveIncome} noValidate>
          <h2 id="inc-title">{isEditing ? 'Edit income' : 'Add income'}</h2>

          <label>
            Amount
            <input
              className="amount"
              id="inc-amt"
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

          <div className="chips" role="group" aria-label="Income Category">
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
            Source / Note
            <input
              id="inc-note"
              type="text"
              maxLength={60}
              placeholder="e.g. Monthly salary, Client project (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label>
            Date
            <input
              id="inc-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <p className="err" id="inc-err" role="alert">
            {formError}
          </p>

          <div className="btns">
            <button
              type="button"
              className="ghost"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button className="primary" type="submit">
              {isEditing ? 'Save changes' : 'Save income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IncomeForm
