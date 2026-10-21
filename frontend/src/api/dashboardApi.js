import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const dashboardApi = {
  getSummary: (monthKey) => apiClient(ENDPOINTS.ANALYTICS(monthKey)),
}
