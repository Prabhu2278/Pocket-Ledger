import { useState, useCallback } from 'react'

export function useAuthSlice(showToast, setPage) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pocket_ledger_user')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {}
      }
    }
    return { id: 1, username: 'demo_user', name: 'Treasury Officer' }
  })

  const login = useCallback((user) => {
    setCurrentUser(user)
    localStorage.setItem('pocket_ledger_user', JSON.stringify(user))
    if (showToast) showToast(`Welcome back, ${user.username || 'User'}!`)
    if (setPage) setPage('dashboard')
  }, [showToast, setPage])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('pocket_ledger_user')
    if (showToast) showToast('Logged out successfully')
    if (setPage) setPage('auth')
  }, [showToast, setPage])

  return { currentUser, setCurrentUser, login, logout }
}
