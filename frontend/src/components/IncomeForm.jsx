import React from 'react'
import { INCOME_CATEGORIES } from '../constants/categories'

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
}) {
  if (!dialogOpen) return null

  const isEditing = editingId !== null

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
              placeholder="₹0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>

          <div className="chips" role="group" aria-label="Income Category">
            {INCOME_CATEGORIES.map(([catName]) => (
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
