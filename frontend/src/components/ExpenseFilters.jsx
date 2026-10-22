import React from 'react'
import { CATEGORIES } from '../constants/categories'

export function ExpenseFilters({ filter = 'All', setFilter, categories = [], expenseCategories = [] }) {
  const dbList = (expenseCategories.length > 0
    ? expenseCategories.map((c) => c.name)
    : categories.filter((c) => c.type === 'expense').map((c) => c.name)) || []

  const options = ['All', ...Array.from(new Set([...CATEGORIES.map((c) => c[0]), ...dbList]))]

  return (
    <div className="chips" role="group" aria-label="Filter by category">
      {options.map((name) => (
        <button
          key={name}
          type="button"
          className="chip"
          aria-pressed={filter === name}
          onClick={() => setFilter(name)}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export default ExpenseFilters
