/**
 * expenseApi.js - Centralized API Service for Expenses, Budgets, and Insights
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const LOCAL_STORAGE_KEY = 'pocket_ledger_expenses_data'
const LOCAL_BUDGET_KEY = 'pocket_ledger_budgets_data'

// Helper: Seed default demo transactions if empty
function getLocalExpenses() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // Fallback
    }
  }
  const defaults = [
    { id: 1, title: 'Grocery Shopping', amount: 3450, category: 'Groceries', date: '2026-10-20', payment_method: 'UPI', notes: 'Weekly fruits & vegetables' },
    { id: 2, title: 'House Rent', amount: 22000, category: 'Housing', date: '2026-10-01', payment_method: 'Bank Transfer', notes: 'October rent payment' },
    { id: 3, title: 'Dinner with Friends', amount: 1850, category: 'Food & Dining', date: '2026-10-18', payment_method: 'Credit Card', notes: 'Weekend dinner' },
    { id: 4, title: 'Electricity & Wifi', amount: 2400, category: 'Utilities', date: '2026-10-12', payment_method: 'UPI', notes: 'Broadband + power' },
    { id: 5, title: 'Cab to Airport', amount: 850, category: 'Transportation', date: '2026-10-15', payment_method: 'UPI', notes: 'Uber ride' },
    { id: 6, title: 'Gym Membership', amount: 2500, category: 'Healthcare', date: '2026-10-05', payment_method: 'Card', notes: 'Monthly fitness pass' },
  ]
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults))
  return defaults
}

function saveLocalExpenses(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

function getLocalBudget(monthKey) {
  const stored = localStorage.getItem(LOCAL_BUDGET_KEY)
  const map = stored ? JSON.parse(stored) : {}
  return map[monthKey] || 100000.0
}

function saveLocalBudget(monthKey, amount) {
  const stored = localStorage.getItem(LOCAL_BUDGET_KEY)
  const map = stored ? JSON.parse(stored) : {}
  map[monthKey] = amount
  localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(map))
}

export const expenseApi = {
  // Fetch all expenses with optional filters
  async getExpenses(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.month_key) query.append('month_key', params.month_key)
    if (params.sort_by) query.append('sort_by', params.sort_by)
    if (params.sort_order) query.append('sort_order', params.sort_order)

    try {
      const res = await fetch(`${API_BASE}/expenses?${query.toString()}`)
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      // Offline fallback
    }

    // Local filter fallback
    let items = getLocalExpenses()
    if (params.category && params.category !== 'All') {
      items = items.filter((x) => x.category.toLowerCase() === params.category.toLowerCase())
    }
    if (params.search) {
      const term = params.search.toLowerCase()
      items = items.filter(
        (x) =>
          x.title.toLowerCase().includes(term) ||
          x.category.toLowerCase().includes(term) ||
          (x.notes && x.notes.toLowerCase().includes(term))
      )
    }
    if (params.month_key) {
      items = items.filter((x) => x.date.startsWith(params.month_key))
    }
    items.sort((a, b) => new Date(b.date) - new Date(a.date))
    return items
  },

  // Create new expense
  async createExpense(data) {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      // Offline fallback
    }

    const items = getLocalExpenses()
    const newExpense = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }
    items.unshift(newExpense)
    saveLocalExpenses(items)
    return newExpense
  },

  // Update existing expense
  async updateExpense(id, data) {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      // Offline fallback
    }

    const items = getLocalExpenses()
    const index = items.findIndex((x) => x.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...data }
      saveLocalExpenses(items)
      return items[index]
    }
    throw new Error('Expense not found')
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) return true
    } catch (err) {
      // Offline fallback
    }

    let items = getLocalExpenses()
    items = items.filter((x) => x.id !== id)
    saveLocalExpenses(items)
    return true
  },

  // Fetch monthly budget & insights analytics
  async getInsights(monthKey) {
    try {
      const res = await fetch(`${API_BASE}/insights?month_key=${monthKey}`)
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      // Offline fallback
    }

    const expenses = getLocalExpenses().filter((x) => x.date.startsWith(monthKey))
    const budgetTarget = getLocalBudget(monthKey)
    const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const remainingBudget = Math.max(0, budgetTarget - totalSpent)
    const pctUsed = budgetTarget > 0 ? (totalSpent / budgetTarget) * 100 : 0

    // Category breakdown
    const catMap = {}
    const countMap = {}
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount)
      countMap[e.category] = (countMap[e.category] || 0) + 1
    })

    const breakdown = Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      count: countMap[category],
    })).sort((a, b) => b.amount - a.amount)

    return {
      month_key: monthKey,
      total_spent: totalSpent,
      budget_target: budgetTarget,
      remaining_budget: remainingBudget,
      budget_percentage_used: Math.round(pctUsed * 10) / 10,
      expense_count: expenses.length,
      top_category: breakdown[0]?.category || 'None',
      category_breakdown: breakdown,
    }
  },

  // Save budget target for a month
  async setBudget(monthKey, targetAmount) {
    try {
      const res = await fetch(`${API_BASE}/insights/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month_key: monthKey, target_amount: Number(targetAmount) }),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      // Offline fallback
    }

    saveLocalBudget(monthKey, Number(targetAmount))
    return { month_key: monthKey, target_amount: Number(targetAmount) }
  },
}

export default expenseApi
