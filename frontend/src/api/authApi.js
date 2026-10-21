import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const authApi = {
  login: (credentials) => apiClient(ENDPOINTS.AUTH_LOGIN, { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiClient(ENDPOINTS.AUTH_REGISTER, { method: 'POST', body: JSON.stringify(userData) }),
}
