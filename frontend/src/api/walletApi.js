/**
 * walletApi.js - API client for Wallets & Accounts
 */

import { authApi } from './authApi'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/api$/, '')

export const walletApi = {
  async getWallets() {
    const res = await fetch(`${API_BASE}/api/wallets`, {
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch wallets: ${res.statusText}`)
    }
    return await res.json()
  },

  async createWallet(data) {
    const res = await fetch(`${API_BASE}/api/wallets`, {
      method: 'POST',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        wallet_type: data.wallet_type || data.type || 'BANK',
        initial_balance: Number(data.initial_balance || data.balance || 0),
        color: data.color || '#10b981',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to create wallet')
    }
    return await res.json()
  },

  async updateWallet(id, data) {
    const res = await fetch(`${API_BASE}/api/wallets/${id}`, {
      method: 'PUT',
      headers: authApi.getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        wallet_type: data.wallet_type || data.type,
        initial_balance: data.initial_balance !== undefined ? Number(data.initial_balance) : undefined,
        color: data.color,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to update wallet')
    }
    return await res.json()
  },

  async deleteWallet(id) {
    const res = await fetch(`${API_BASE}/api/wallets/${id}`, {
      method: 'DELETE',
      headers: authApi.getAuthHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to delete wallet')
    }
    return await res.json()
  },
}

export default walletApi
