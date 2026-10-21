import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const transactionApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val)
      }
    })
    const query = searchParams.toString()
    return apiClient(query ? `${ENDPOINTS.EXPENSES.BASE}?${query}` : ENDPOINTS.EXPENSES.BASE)
  },

  create: (data) =>
    apiClient(ENDPOINTS.EXPENSES.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiClient(ENDPOINTS.EXPENSES.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiClient(ENDPOINTS.EXPENSES.BY_ID(id), {
      method: 'DELETE',
    }),
}

export default transactionApi
