/**
 * transactionApi.js - Centralized API Service for Unified Transactions & CSV
 */

import { authApi } from './authApi'
import { expenseApi } from './expenseApi'
import { incomeApi } from './incomeApi'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

export const transactionApi = {
  // Get unified list of transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams()
    if (params.month_key) query.append('month_key', params.month_key)
    if (params.start_date) query.append('start_date', params.start_date)
    if (params.end_date) query.append('end_date', params.end_date)
    if (params.type && params.type !== 'all') query.append('type', params.type)
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.sort_by) query.append('sort_by', params.sort_by)
    if (params.sort_order) query.append('sort_order', params.sort_order)
    query.append('limit', String(params.limit || 5000))

    const res = await fetch(`${API_BASE}/api/transactions?${query.toString()}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch transactions: ${res.statusText}`)
    }
    return await res.json()
  },

  // Create single transaction (income or expense)
  async createTransaction(payload) {
    const body = {
      type: payload.type || 'expense',
      amount: Number(payload.amount || payload.amt),
      amt: Number(payload.amount || payload.amt),
      category: payload.category || payload.cat,
      cat: payload.category || payload.cat,
      note: payload.note || payload.title || '',
      title: payload.note || payload.title || '',
      date: payload.date || payload.spent_on || payload.received_on,
      payment_method: payload.payment_method || 'UPI',
    }
    if (payload.wallet_id) {
      body.wallet_id = Number(payload.wallet_id)
    }
    if (payload.to_wallet_id) {
      body.to_wallet_id = Number(payload.to_wallet_id)
    }

    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to save transaction')
    }
    return await res.json()
  },

  // Update existing transaction
  async updateTransaction(id, type, payload) {
    const body = {
      type: payload.type || type,
      amount: Number(payload.amount || payload.amt),
      amt: Number(payload.amount || payload.amt),
      category: payload.category || payload.cat,
      cat: payload.category || payload.cat,
      note: payload.note || payload.title || '',
      title: payload.note || payload.title || '',
      date: payload.date || payload.spent_on || payload.received_on,
      payment_method: payload.payment_method || 'UPI',
    }
    if (payload.wallet_id) {
      body.wallet_id = Number(payload.wallet_id)
    }
    if (payload.to_wallet_id) {
      body.to_wallet_id = Number(payload.to_wallet_id)
    }

    try {
      const res = await fetch(`${API_BASE}/api/transactions/${id}?type=${type || ''}`, {
        method: 'PUT',
        headers: authApi.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fallback
    }

    if (type === 'income') {
      return await incomeApi.updateIncome(id, body)
    } else {
      return await expenseApi.updateExpense(id, body)
    }
  },

  // Delete transaction
  async deleteTransaction(id, type) {
    try {
      const res = await fetch(`${API_BASE}/api/transactions/${id}?type=${type || ''}`, {
        method: 'DELETE',
        headers: authApi.getAuthHeaders(),
      })
      if (res.ok) {
        return true
      }
    } catch {
      // Fallback
    }

    if (type === 'income') {
      return await incomeApi.deleteIncome(id)
    } else {
      return await expenseApi.deleteExpense(id)
    }
  },

  // Bulk import transactions from CSV
  async bulkImport(transactions) {
    const res = await fetch(`${API_BASE}/api/transactions/bulk`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({ transactions }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to bulk import transactions')
    }
    return await res.json()
  },

  // Export CSV download URL
  getExportCsvUrl(params = {}) {
    const query = new URLSearchParams()
    if (params.month_key) query.append('month_key', params.month_key)
    if (params.type && params.type !== 'all') query.append('type', params.type)
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    return `${API_BASE}/api/transactions/export-csv?${query.toString()}`
  },
}

export default transactionApi
