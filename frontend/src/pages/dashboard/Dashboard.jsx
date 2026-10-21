import React from 'react'
import { WalletBar } from '@/components/wallets/WalletBar'
import { DashboardKpis } from './components/DashboardKpis'
import { BudgetOverviewCard } from './components/BudgetOverviewCard'
import { WeeklySpendingChart } from './components/WeeklySpendingChart'
import { SpendingCategoryCard } from './components/SpendingCategoryCard'
import { RecentActivityCard } from './components/RecentActivityCard'
import './Dashboard.css'

export function Dashboard({
  totalSpent = 0,
  totalIncome = 0,
  totalExpense = 0,
  budget = 45000,
  budgetLeft = 0,
  budgetPercent = 0,
  monthTransactions = [],
  rankedCategories = [],
  categoryTotals = {},
  visibleTransactions = [],
  wallets = [],
  selectedWallet = 'all',
  onSelectWallet = () => {},
  onAddWallet = () => {},
  onUpdateWallet = () => {},
  onDeleteWallet = () => {},
  openExpenseDialog,
  setDeleteConfirmId,
}) {
  return (
    <section className="pocket-ledger-expenses-view pocket-dashboard-section" aria-label="Dashboard Overview">
      {/* 1. Accounts & Wallets Carousel at the top */}
      <WalletBar
        wallets={wallets}
        selectedWallet={selectedWallet}
        onSelectWallet={onSelectWallet}
        onAddWallet={onAddWallet}
        onUpdateWallet={onUpdateWallet}
        onDeleteWallet={onDeleteWallet}
      />

      {/* 2. Total Income, Total Expense, Net Flow, and Remaining Budget KPIs */}
      <DashboardKpis
        totalIncome={totalIncome}
        totalExpense={totalExpense || totalSpent}
        budgetLeft={budgetLeft}
        totalEntries={monthTransactions.length}
      />

      {/* 3. Monthly Budget on Left, Last 7 Days Spending on Right */}
      <div className="pocket-dashboard-row-grid">
        <BudgetOverviewCard
          totalSpent={totalSpent}
          budget={budget}
          budgetLeft={budgetLeft}
          budgetPercent={budgetPercent}
        />

        <WeeklySpendingChart
          monthTransactions={monthTransactions}
        />
      </div>

      {/* 4. Spending Category on Left, Recent Activity on Right */}
      <div className="pocket-dashboard-row-grid">
        <SpendingCategoryCard
          categoryTotals={categoryTotals}
        />

        <RecentActivityCard
          visibleTransactions={visibleTransactions}
          openExpenseDialog={openExpenseDialog}
          setDeleteConfirmId={setDeleteConfirmId}
        />
      </div>
    </section>
  )
}

export default Dashboard
