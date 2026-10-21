import React from 'react'
import { useApp } from '@/context/AppContext'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Wallets } from '@/pages/Wallets'
import { Settings } from '@/pages/Settings'
import { AppLayout } from '@/components/layout/AppLayout'
import { WalletBar } from '@/components/wallets/WalletBar'
import { ExpenseModal } from '@/components/transactions/ExpenseModal'
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal'
import { BudgetConfirmModal } from '@/components/budget/BudgetConfirmModal'
import { CsvImportModal } from '@/components/CsvImportModal'
import { FilterDrawer } from '@/components/FilterDrawer'
import { Toast } from '@/components/ui/Toast/Toast'
import { LogoutConfirmModal } from '@/components/auth/LogoutConfirmModal'

export function AppRoutes() {
  const { currentUser, page } = useApp()

  // Reset scroll to top whenever switching between pages
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }, [page])

  if (!currentUser) {
    return <Login />
  }

  return (
    <AppLayout>
      {/* WalletBar is rendered on Dashboard for quick balances */}
      {page === 'dashboard' && <WalletBar />}

      {page === 'dashboard' ? (
        <Dashboard />
      ) : page === 'wallets' ? (
        <Wallets />
      ) : page === 'settings' ? (
        <Settings />
      ) : (
        <Transactions />
      )}

      {/* Global Modals & Notifications */}
      <ExpenseModal />
      <CsvImportModal />
      <DeleteConfirmModal />
      <BudgetConfirmModal />
      <LogoutConfirmModal />
      <FilterDrawer />
      <Toast />
    </AppLayout>
  )
}

export default AppRoutes
