import { useMemo } from 'react'

export function useAnalyticsSlice(expensesSlice = {}, budgetSlice = {}) {
  const { monthTransactions = [], totalSpent = 0, totalIncome = 0, categoryTotals = {} } = expensesSlice
  const { budget = 45000 } = budgetSlice

  const netSavings = useMemo(() => totalIncome - totalSpent, [totalIncome, totalSpent])
  const remainingBudget = useMemo(() => Math.max(0, budget - totalSpent), [budget, totalSpent])
  const budgetUtilization = useMemo(() => {
    return budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0
  }, [budget, totalSpent])

  return {
    totalSpent,
    totalIncome,
    netSavings,
    remainingBudget,
    budgetUtilization,
    categoryTotals,
  }
}
