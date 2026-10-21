import React from 'react'
import { BudgetRing } from '../../../components/BudgetRing'

export function BudgetOverviewCard({ totalSpent, budget, budgetLeft, budgetPercent }) {
  return (
    <div className="pocket-ledger-card">
      <h2>Monthly Budget</h2>
      <BudgetRing
        totalSpent={totalSpent}
        budget={budget}
        budgetLeft={budgetLeft}
        budgetPercent={budgetPercent}
      />
    </div>
  )
}

export default BudgetOverviewCard
