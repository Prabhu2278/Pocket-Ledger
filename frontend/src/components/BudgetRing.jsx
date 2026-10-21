import React from 'react'
import { money } from '../utils/formatCurrency'

export function BudgetRing({
  totalSpent = 0,
  budget = 20000,
  budgetLeft = 0,
  budgetPercent = 0,
  daysLeft = 'Closed',
  currency = 'INR',
}) {
  const pct = Math.max(budgetPercent, 0)
  const clampedPct = Math.min(pct, 1)
  const strokeOffset = 326.7 * (1 - clampedPct)

  const strokeColor =
    pct >= 1
      ? 'var(--out)'
      : pct >= 0.8
      ? 'var(--warn)'
      : 'var(--acc)'

  return (
    <div className="ringbox">
      <div className="ring">
        <svg
          viewBox="0 0 120 120"
          id="ringsvg"
          role="img"
          aria-label={`${Math.round(pct * 100)}% of the budget used`}
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--bg)"
            strokeWidth="12"
          />
          <circle
            id="arc"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="326.7"
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.7s, stroke 0.3s' }}
          />
        </svg>
        <div className="mid">
          <b id="left">
            {budgetLeft < 0 ? '-' : ''}
            {money(Math.abs(budgetLeft), currency)}
          </b>
          <small id="leftlbl">
            {budgetLeft < 0 ? 'over budget' : 'left to spend'}
          </small>
        </div>
      </div>

      <div>
        <div className="st">
          <span>Spent</span>
          <b id="spent">{money(totalSpent, currency)}</b>
        </div>
        <div className="st">
          <span>Budget</span>
          <b id="bud">{money(budget, currency)}</b>
        </div>
        <div className="st">
          <span>Days left</span>
          <b id="days">{daysLeft}</b>
        </div>
      </div>
    </div>
  )
}

export default BudgetRing
