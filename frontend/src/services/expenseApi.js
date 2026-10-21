/**
 * expenseApi.js - Centralized API Service for Expenses, Budgets, and Insights
 */

import { authApi } from './authApi'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

export const expenseApi = {
  // Fetch expenses with optional month, category, search, and sorting filters
  async getExpenses(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.month_key) query.append('month_key', params.month_key)
    if (params.sort_by) query.append('sort_by', params.sort_by)
    if (params.sort_order) query.append('sort_order', params.sort_order)
    query.append('limit', '500')

    const res = await fetch(`${API_BASE}/api/expenses?${query.toString()}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch expenses: ${res.statusText}`)
    }
    return await res.json()
  },

  // Fetch single expense by ID
  async getExpense(id) {
    const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch expense ${id}`)
    }
    return await res.json()
  },

  // Create an expense
  async createExpense(payload) {
    const res = await fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        amt: Number(payload.amt || payload.amount),
        amount: Number(payload.amount || payload.amt),
        cat: payload.cat || payload.category,
        category: payload.category || payload.cat,
        note: payload.note || payload.title || '',
        title: payload.title || payload.note || '',
        date: payload.date || payload.spent_on,
        spent_on: payload.spent_on || payload.date,
        payment_method: payload.payment_method || 'UPI',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to save expense')
    }
    return await res.json()
  },

  // Update existing expense
  async updateExpense(id, payload) {
    const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        amt: Number(payload.amt || payload.amount),
        amount: Number(payload.amount || payload.amt),
        cat: payload.cat || payload.category,
        category: payload.category || payload.cat,
        note: payload.note || payload.title || '',
        title: payload.title || payload.note || '',
        date: payload.date || payload.spent_on,
        spent_on: payload.spent_on || payload.date,
        payment_method: payload.payment_method || 'UPI',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to update expense')
    }
    return await res.json()
  },

  // Delete expense
  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok && res.status !== 204) {
      throw new Error('Failed to delete expense')
    }
    return true
  },

  // Get monthly budget
  async getBudget(monthKey) {
    const res = await fetch(`${API_BASE}/api/insights/budget?month_key=${monthKey}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error('Failed to fetch budget')
    }
    return await res.json()
  },

  // Update monthly budget
  async setBudget(monthKey, targetAmount) {
    const res = await fetch(`${API_BASE}/api/insights/budget`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        month_key: monthKey,
        target_amount: Number(targetAmount),
      }),
    })
    if (!res.ok) {
      throw new Error('Failed to set budget')
    }
    return await res.json()
  },

  // Get full insights summary
  async getInsights(monthKey) {
    const res = await fetch(`${API_BASE}/api/insights?month_key=${monthKey}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error('Failed to fetch insights')
    }
    return await res.json()
  },
}
