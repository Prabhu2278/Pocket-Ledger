import React from 'react'
import { ExpenseList } from '../../../components/ExpenseList'

export function RecentActivityCard({ visibleTransactions, openExpenseDialog, setDeleteConfirmId }) {
  return (
    <div className="pocket-ledger-card">
      <h2>Recent Expenses</h2>
      <ExpenseList
        visibleTransactions={visibleTransactions.slice(0, 5)}
        openExpenseDialog={openExpenseDialog}
        setDeleteConfirmId={setDeleteConfirmId}
      />
    </div>
  )
}

export default RecentActivityCard
