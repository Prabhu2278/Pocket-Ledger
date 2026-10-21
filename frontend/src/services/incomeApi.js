/**
 * incomeApi.js - Income Management API Service
 */

import { authApi } from './authApi'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

export const incomeApi = {
  async getIncomes(params = {}) {
    const query = new URLSearchParams()
    if (params.category && params.category !== 'All') query.append('category', params.category)
    if (params.search) query.append('search', params.search)
    if (params.month_key) query.append('month_key', params.month_key)
    if (params.sort_by) query.append('sort_by', params.sort_by)
    if (params.sort_order) query.append('sort_order', params.sort_order)
    query.append('limit', '500')

    const res = await fetch(`${API_BASE}/api/income?${query.toString()}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch income: ${res.statusText}`)
    }
    return await res.json()
  },

  async getIncome(id) {
    const res = await fetch(`${API_BASE}/api/income/${id}`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to fetch income record ${id}`)
    return await res.json()
  },

  async createIncome(payload) {
    const res = await fetch(`${API_BASE}/api/income`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        amt: Number(payload.amt || payload.amount),
        amount: Number(payload.amount || payload.amt),
        cat: payload.cat || payload.category,
        category: payload.category || payload.cat,
        note: payload.note || payload.title || '',
        title: payload.title || payload.note || '',
        date: payload.date || payload.received_on,
        received_on: payload.received_on || payload.date,
        payment_method: payload.payment_method || 'Bank Transfer',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to save income')
    }
    return await res.json()
  },

  async updateIncome(id, payload) {
    const res = await fetch(`${API_BASE}/api/income/${id}`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        amt: Number(payload.amt || payload.amount),
        amount: Number(payload.amount || payload.amt),
        cat: payload.cat || payload.category,
        category: payload.category || payload.cat,
        note: payload.note || payload.title || '',
        title: payload.title || payload.note || '',
        date: payload.date || payload.received_on,
        received_on: payload.received_on || payload.date,
        payment_method: payload.payment_method || 'Bank Transfer',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to update income')
    }
    return await res.json()
  },

  async deleteIncome(id) {
    const res = await fetch(`${API_BASE}/api/income/${id}`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok && res.status !== 204) {
      throw new Error('Failed to delete income')
    }
    return true
  },
}
