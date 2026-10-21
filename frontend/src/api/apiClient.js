export async function apiClient(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }

  // Handle FormData where Content-Type should not be JSON
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']
  }

  try {
    const res = await fetch(url, config)
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || `Request failed with status ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[apiClient] Offline or fetch error for ${url}:`, err.message)
    throw err
  }
}
