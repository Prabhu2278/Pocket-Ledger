import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const walletApi = {
  getAll: () => apiClient(ENDPOINTS.WALLETS),
  create: (wallet) => apiClient(ENDPOINTS.WALLETS, { method: 'POST', body: JSON.stringify(wallet) }),
  update: (id, wallet) => apiClient(`${ENDPOINTS.WALLETS}/${id}`, { method: 'PUT', body: JSON.stringify(wallet) }),
  delete: (id) => apiClient(`${ENDPOINTS.WALLETS}/${id}`, { method: 'DELETE' }),
}
