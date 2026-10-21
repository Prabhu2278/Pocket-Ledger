import React from 'react'
import { money } from '../../../utils/formatCurrency'

export function DashboardKpis({ totalIncome = 0, totalExpense = 0, budgetLeft = 0, totalEntries = 0 }) {
  const netSavings = totalIncome - totalExpense
  const isNetPositive = netSavings >= 0

  return (
    <div className="pocket-ledger-kpi-grid">
      <div className="pocket-ledger-card pocket-ledger-kpi">
        <span>Total Income</span>
        <b style={{ color: '#10b981' }}>
          +{money(totalIncome)}
        </b>
      </div>

      <div className="pocket-ledger-card pocket-ledger-kpi">
        <span>Total Expense</span>
        <b style={{ color: totalExpense > 0 ? 'var(--pocket-out, #ef4444)' : 'inherit' }}>
          {money(totalExpense)}
        </b>
      </div>

      <div className="pocket-ledger-card pocket-ledger-kpi">
        <span>Net Cash Flow</span>
        <b style={{ color: isNetPositive ? '#10b981' : '#ef4444' }}>
          {isNetPositive ? '+' : ''}{money(netSavings)}
        </b>
      </div>

      <div className="pocket-ledger-card pocket-ledger-kpi">
        <span>Remaining Budget</span>
        <b>
          {budgetLeft < 0 ? '-' : ''}
          {money(Math.abs(budgetLeft))}
        </b>
      </div>
    </div>
  )
}

export default DashboardKpis
