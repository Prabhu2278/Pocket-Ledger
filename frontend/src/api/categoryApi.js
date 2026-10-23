/**
 * categoryApi.js - API client for managing database-backed transaction and income categories
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/api$/, '')
const TOKEN_KEY = 'pocket_ledger_auth_token'

export const categoryApi = {
  getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  },

  async getCategories(type = null) {
    try {
      const url = new URL(`${API_BASE}/api/categories`)
      if (type) url.searchParams.append('type', type)

      const res = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`)
      }
      return await res.json()
    } catch (err) {
      console.warn('[CategoryApi] Could not load categories from backend:', err)
      return []
    }
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Failed to create category')
    }
    return await res.json()
  },

  async updateCategory(categoryId, categoryData) {
    const res = await fetch(`${API_BASE}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Failed to update category')
    }
    return await res.json()
  },

  async deleteCategory(categoryId) {
    const res = await fetch(`${API_BASE}/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Failed to delete category')
    }
    return await res.json()
  },
}

export default categoryApi
