import React from 'react'
import { money } from '../utils/formatCurrency'
import { BudgetRing } from '../components/BudgetRing'
import { ExpenseList } from '../components/ExpenseList'

export function Dashboard({
  totalSpent,
  budget,
  budgetLeft,
  budgetPercent,
  monthTransactions,
  rankedCategories,
  visibleTransactions,
  sort,
  sortBy,
  openExpenseDialog,
  setDeleteConfirmId,
}) {
  return (
    <section className="pocket-ledger-expenses-view" aria-label="Dashboard Overview">
      <div className="pocket-ledger-kpi-grid">
        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Total Spent</span>
          <b>{money(totalSpent)}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Remaining Budget</span>
          <b>
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft))}
          </b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Total Entries</span>
          <b>{monthTransactions.length}</b>
        </div>

        <div className="pocket-ledger-card pocket-ledger-kpi">
          <span>Top Category</span>
          <b>{rankedCategories[0] || 'None'}</b>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '20px', marginTop: '16px' }}>
        <div className="pocket-ledger-card">
          <h2>Monthly Budget</h2>
          <BudgetRing
            totalSpent={totalSpent}
            budget={budget}
            budgetLeft={budgetLeft}
            budgetPercent={budgetPercent}
          />
        </div>

        <div className="pocket-ledger-card">
          <h2>Recent Expenses</h2>
          <ExpenseList
            visibleTransactions={visibleTransactions.slice(0, 5)}
            monthTransactions={monthTransactions}
            sort={sort}
            sortBy={sortBy}
            openExpenseDialog={openExpenseDialog}
            setDeleteConfirmId={setDeleteConfirmId}
          />
        </div>
      </div>
    </section>
  )
}

export default Dashboard
