export const API_BASE_URL = 'http://localhost:9000/api/v1'

export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  WALLETS: `${API_BASE_URL}/wallets`,
  EXPENSES: `${API_BASE_URL}/expenses`,
  BUDGETS: (monthKey) => `${API_BASE_URL}/budgets/${monthKey}`,
  ANALYTICS: (monthKey) => `${API_BASE_URL}/analytics/summary/${monthKey}`,
  CSV_PREVIEW: `${API_BASE_URL}/csv/preview`,
  CSV_IMPORT: `${API_BASE_URL}/csv/import`,
}
