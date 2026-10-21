import React from 'react'
import { money } from '../utils/formatCurrency'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ExpenseList } from '../components/ExpenseList'

export function Expenses({
  totalSpent,
  budgetLeft,
  monthTransactions,
  rankedCategories,
  filter,
  setFilter,
  visibleTransactions,
  sort,
  sortBy,
  openExpenseDialog,
  setDeleteConfirmId,
}) {
  return (
    <section className="pocket-ledger-expenses-view" aria-label="Expenses module">
      <div className="pocket-ledger-kpi-grid">
        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Spent this month</span>
          <b>{money(totalSpent)}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Left in budget</span>
          <b>
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft))}
          </b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Transactions</span>
          <b>{monthTransactions.length}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Biggest category</span>
          <b>{rankedCategories[0] || 'None yet'}</b>
        </div>
      </div>

      <div className="pocket-ledger-card">
        <ExpenseFilters filter={filter} setFilter={setFilter} />

        <ExpenseList
          visibleTransactions={visibleTransactions}
          monthTransactions={monthTransactions}
          sort={sort}
          sortBy={sortBy}
          openExpenseDialog={openExpenseDialog}
          setDeleteConfirmId={setDeleteConfirmId}
        />
      </div>
    </section>
  )
}

export default Expenses
