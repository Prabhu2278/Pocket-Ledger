import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const budgetApi = {
  get: (monthKey) => apiClient(ENDPOINTS.BUDGETS(monthKey)),
  set: (monthKey, targetAmount) => apiClient(ENDPOINTS.BUDGETS(monthKey), {
    method: 'POST',
    body: JSON.stringify({ target_amount: targetAmount })
  }),
}
