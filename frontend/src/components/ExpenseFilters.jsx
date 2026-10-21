import React from 'react'
import { CATEGORIES } from '../constants/categories'

export function ExpenseFilters({ filter = 'All', setFilter }) {
  const options = ['All', ...CATEGORIES.map((c) => c[0])]

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
