import { useState, useCallback } from 'react'

export function useBudgetSlice(showToast) {
  const [budget, setBudget] = useState(45000)
  const [monthlyBudgets, setMonthlyBudgets] = useState({})
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)

  const saveBudget = useCallback((monthKey, amount) => {
    const num = Number(amount) || 0
    setBudget(num)
    setMonthlyBudgets((prev) => ({ ...prev, [monthKey]: num }))
    if (showToast) showToast('Budget updated')
  }, [showToast])

  return {
    budget,
    setBudget,
    monthlyBudgets,
    setMonthlyBudgets,
    budgetModalOpen,
    setBudgetModalOpen,
    saveBudget,
  }
}
