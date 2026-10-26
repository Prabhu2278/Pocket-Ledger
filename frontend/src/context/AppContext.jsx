import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToastSlice } from './modules/useToastSlice'
import { useAuthSlice } from './modules/useAuthSlice'
import { useThemeSlice } from './modules/useThemeSlice'
import { useBudgetSlice } from './modules/useBudgetSlice'
import { useFilterSlice } from './modules/useFilterSlice'
import { useWalletsSlice } from './modules/useWalletsSlice'
import { useTransactionForm } from './modules/useTransactionForm'
import { useExpensesSlice } from './modules/useExpensesSlice'
import { useAnalyticsSlice } from './modules/useAnalyticsSlice'
import { useCsvSlice } from './modules/useCsvSlice'
import { useSettingsSlice } from './modules/useSettingsSlice'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Page routing
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('expenses')) return 'expenses'
      if (hash.includes('insights')) return 'insights'
      if (hash.includes('wallets')) return 'wallets'
      if (hash.includes('settings') || hash.includes('profile')) return 'settings'
      if (hash.includes('dashboard')) return 'dashboard'
    }
    return 'dashboard'
  })

  useEffect(() => {
    function handleRoute() {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('expenses')) setPage('expenses')
      else if (hash.includes('insights')) setPage('insights')
      else if (hash.includes('wallets')) setPage('wallets')
      else if (hash.includes('settings') || hash.includes('profile')) setPage('settings')
      else setPage('dashboard')
    }
    window.addEventListener('hashchange', handleRoute)
    return () => window.removeEventListener('hashchange', handleRoute)
  }, [])

  // Month navigation
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() }
  })

  // Slices
  const toastSlice = useToastSlice()
  const authSlice = useAuthSlice(toastSlice.showToast, setPage)
  const themeSlice = useThemeSlice()
  const filterSlice = useFilterSlice()
  const budgetSlice = useBudgetSlice(toastSlice.showToast)
  const settingsSlice = useSettingsSlice(toastSlice.showToast)

  const walletsSlice = useWalletsSlice(
    authSlice.currentUser,
    [],
    [],
    null,
    toastSlice.showToast
  )

  const formSlice = useTransactionForm(walletsSlice.wallets)

  const expensesSlice = useExpensesSlice({
    currentUser: authSlice.currentUser,
    wallets: walletsSlice.wallets,
    setWallets: walletsSlice.setWallets,
    computedWallets: walletsSlice.computedWallets,
    month,
    setMonth,
    filterSlice: {
      ...filterSlice,
      selectedWallet: walletsSlice.selectedWallet,
    },
    formSlice,
    showToast: toastSlice.showToast,
  })

  const analyticsSlice = useAnalyticsSlice(expensesSlice, budgetSlice)
  const csvSlice = useCsvSlice(expensesSlice.setData, toastSlice.showToast)

  const changeMonth = (delta) => {
    setMonth((prev) => {
      let m = prev.month + delta
      let y = prev.year
      if (m > 11) {
        m = 0
        y++
      } else if (m < 0) {
        m = 11
        y--
      }
      return { year: y, month: m }
    })
  }

  const value = {
    page,
    setPage,
    month,
    setMonth,
    changeMonth,
    ...toastSlice,
    ...authSlice,
    ...themeSlice,
    ...filterSlice,
    ...budgetSlice,
    ...settingsSlice,
    ...walletsSlice,
    ...formSlice,
    ...expensesSlice,
    ...analyticsSlice,
    ...csvSlice,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export const useApp = useAppContext
export default AppContext
