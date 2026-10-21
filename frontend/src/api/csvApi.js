import { apiClient } from './apiClient'
import { ENDPOINTS } from './endpoints'

export const csvApi = {
  preview: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient(ENDPOINTS.CSV_PREVIEW, { method: 'POST', body: formData })
  },
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient(ENDPOINTS.CSV_IMPORT, { method: 'POST', body: formData })
  },
}
