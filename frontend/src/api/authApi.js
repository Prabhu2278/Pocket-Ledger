/**
 * authApi.js - Authentication & Profile API service
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

const TOKEN_KEY = 'pocket_ledger_auth_token'
const USER_KEY = 'pocket_ledger_auth_user'

export const authApi = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  },

  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY)
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  },

  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  },

  getAuthHeaders() {
    const token = this.getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  },

  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed')
    }
    this.setToken(data.access_token)
    this.setUser(data.user)
    return data
  },

  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || 'Invalid email or password')
    }
    this.setToken(data.access_token)
    this.setUser(data.user)
    return data
  },

  async getMe() {
    const token = this.getToken()
    if (!token) return null
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: this.getAuthHeaders(),
    })
    if (!res.ok) {
      if (res.status === 401) {
        this.logout()
      }
      return null
    }
    const user = await res.json()
    this.setUser(user)
    return user
  },

  async updateProfile(payload) {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to update profile')
    this.setUser(data)
    return data
  },

  async changePassword({ current_password, new_password }) {
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Failed to change password')
    return data
  },

  logout() {
    this.setToken(null)
    this.setUser(null)
  },
}

export default authApi
