import React from 'react'
import { useApp } from '@/context/AppContext'
import { AuthPage } from '@/pages/auth/AuthPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { WalletsPage } from '@/pages/wallets/WalletsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { WalletBar } from '@/components/wallets/WalletBar'
import { ExpenseModal } from '@/components/transactions/ExpenseModal'
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal'
import { BudgetConfirmModal } from '@/components/budget/BudgetConfirmModal'
import { CsvImportModal } from '@/components/csv/CsvImportModal'
import { FilterDrawer } from '@/components/filters/FilterDrawer'
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
    return <AuthPage />
  }

  return (
    <AppLayout>
      {/* WalletBar is rendered on Dashboard for quick balances */}
      {page === 'dashboard' && <WalletBar />}

      {page === 'dashboard' ? (
        <DashboardPage />
      ) : page === 'wallets' ? (
        <WalletsPage />
      ) : page === 'settings' ? (
        <SettingsPage />
      ) : (
        <TransactionsPage />
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
