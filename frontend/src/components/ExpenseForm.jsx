import React from 'react'
import { CATEGORIES } from '../constants/categories'

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

  const isEditing = editingId !== null

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
              placeholder="₹0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>

          <div className="chips" role="group" aria-label="Category">
            {CATEGORIES.map(([catName]) => (
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
