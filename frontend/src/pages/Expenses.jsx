import React from 'react'
import { money } from '../utils/formatCurrency'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpenseList } from '../components/ExpenseList'

export function Expenses({
  totalSpent = 0,
  budgetLeft = 0,
  monthTransactions = [],
  rankedCategories = [],
  filter = 'All',
  setFilter,
  visibleTransactions = [],
  sort = { key: 'date', direction: -1 },
  onSort,
  openExpenseDialog,
  onDeleteExpense,
}) {
  const biggestCategory = rankedCategories[0] || 'None yet'

  return (
    <section className="view on" id="v1" aria-label="Expenses module">
      <div className="kpis">
        <div className="card kpi">
          <span>Spent this month</span>
          <b id="k1">{money(totalSpent)}</b>
        </div>
        <div className="card kpi">
          <span>Left in budget</span>
          <b id="k2">
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft))}
          </b>
        </div>
        <div className="card kpi">
          <span>Transactions</span>
          <b id="k3">{monthTransactions.length}</b>
        </div>
        <div className="card kpi">
          <span>Biggest category</span>
          <b id="k4">{biggestCategory}</b>
        </div>
      </div>

      <div className="card">
        <ExpenseFilters filter={filter} setFilter={setFilter} />
        <ExpenseList
          visibleTransactions={visibleTransactions}
          monthTransactions={monthTransactions}
          sort={sort}
          onSort={onSort}
          onEdit={openExpenseDialog}
          onDelete={onDeleteExpense}
        />
      </div>
    </section>
  )
}

export default Expenses
