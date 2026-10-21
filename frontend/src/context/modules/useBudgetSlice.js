import { useState, useCallback, useEffect } from 'react'
import { expenseApi } from '../../services/expenseApi'

export function useBudgetSlice(showToast) {
  const [budget, setBudget] = useState(20000)
  const [monthlyBudgets, setMonthlyBudgets] = useState({})
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)

  const loadBudgetForMonth = useCallback(async (monthKey) => {
    try {
      const resp = await expenseApi.getBudget(monthKey)
      if (resp && (resp.target_amount !== undefined || resp.budget !== undefined)) {
        const val = Number(resp.target_amount || resp.budget)
        setBudget(val)
        setMonthlyBudgets((prev) => ({ ...prev, [monthKey]: val }))
      }
    } catch (err) {
      console.error('Failed to load budget from DB:', err)
    }
  }, [])

  const saveBudget = useCallback(
    async (monthKey, amount) => {
      const num = Number(amount) || 0
      setBudget(num)
      setMonthlyBudgets((prev) => ({ ...prev, [monthKey]: num }))
      try {
        await expenseApi.setBudget(monthKey, num)
        if (showToast) showToast(`Budget saved to database: ${num}`)
      } catch (err) {
        if (showToast) showToast('Failed to save budget to database')
      }
    },
    [showToast]
  )

  return {
    budget,
    setBudget,
    monthlyBudgets,
    setMonthlyBudgets,
    budgetModalOpen,
    setBudgetModalOpen,
    saveBudget,
    loadBudgetForMonth,
  }
}

export default useBudgetSlice
