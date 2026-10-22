/**
 * settingsApi.js - Settings API service for persisting theme, currency, and user preferences in DB
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

const TOKEN_KEY = 'pocket_ledger_auth_token'

export const settingsApi = {
  getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  },

  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        headers: this.getAuthHeaders(),
      })
      if (!res.ok) return null
      return await res.json()
    } catch (err) {
      console.warn('[SettingsApi] Could not fetch settings from server:', err)
      return null
    }
  },

  async updateSettings(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to update settings')
      }
      return await res.json()
    } catch (err) {
      console.warn('[SettingsApi] Could not persist settings to server:', err)
      return null
    }
  },
}

export default settingsApi
