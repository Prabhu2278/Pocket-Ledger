import React from 'react'
import { money } from '../utils/formatCurrency'

export function BudgetRing({ totalSpent, budget, budgetLeft, budgetPercent }) {
  const ringCircumference = 326.7
  const strokeDashoffset = ringCircumference * (1 - Math.min(budgetPercent, 1))

  const strokeColor =
    budgetPercent >= 1
      ? 'var(--pocket-out)'
      : budgetPercent >= 0.8
      ? 'var(--pocket-warn)'
      : 'var(--pocket-accent)'

  return (
    <div className="pocket-ledger-budget-ring-layout">
      <div className="pocket-ledger-ring">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${Math.round(budgetPercent * 100)}% of budget used`}
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--pocket-bg)"
            strokeWidth="12"
          />

          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="pocket-ledger-ring-center">
          <b>
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft))}
          </b>
          <small>
            {budgetLeft < 0 ? 'over budget' : 'left to spend'}
          </small>
        </div>
      </div>

      <div className="pocket-ledger-budget-stats">
        <span>Spent</span>
        <b>{money(totalSpent)}</b>
        <span>Budget</span>
        <b>{money(budget)}</b>
        <span>Used</span>
        <b>{Math.round(budgetPercent * 100)}%</b>
      </div>
    </div>
  )
}

export default BudgetRing
