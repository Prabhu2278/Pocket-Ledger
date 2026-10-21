import React from 'react'
import { CATEGORIES } from '../hooks/useExpenses'

export function ExpenseFilters({ filter, setFilter }) {
  const categoryList = ['All', ...CATEGORIES.map(([name]) => name)]

  return (
    <div
      className="pocket-ledger-category-filters"
      role="group"
      aria-label="Filter by category"
    >
      {categoryList.map((name) => (
        <button
          type="button"
          key={name}
          className="pocket-ledger-chip"
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
