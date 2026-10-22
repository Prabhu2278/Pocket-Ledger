import React, { useState } from 'react'
import './App.css'
import { useExpenses } from './hooks/useExpenses'
import { MainLayout } from './layouts/MainLayout'
import { Transactions } from './pages/Transactions'
import { Insights } from './pages/Insights'
import { Dashboard } from './pages/Dashboard'
import { Wallets } from './pages/Wallets'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ConfirmModal } from './components/ConfirmDialog'

export function App() {
  const {
    // Core & Nav
    month,
    changeMonth,
    page,
    // Theme & Currency
    theme,
    setTheme,
    toggleTheme,
    currency,
    setCurrency,
    // Auth
    user,
    login,
    logout,
    register,
    onUserUpdate,
    // Unified Transactions & Filtering
    transactions,
    monthTransactions,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    sort,
    toggleSort,
    totalIncome,
    totalSpent,
    netCashFlow,
    budget,
    budgetLeft,
    budgetPercent,
    categoryTotals,
    rankedCategories,
    incomeCategoryTotals,
    rankedIncomeCategories,
    daysLeft,
    isCurrentMonth,
    last7Days,
    activityLogs,
    // Filter Drawer & Advanced Filters
    isFilterDrawerOpen,
    openFilterDrawer,
    closeFilterDrawer,
    walletFilter,
    setWalletFilter,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    paymentMethodFilter,
    setPaymentMethodFilter,
    resetFilters,
    activeFilterCount,
    totalFilteredCount,
    // Unified Transaction Dialog
    dialogOpen,
    setDialogOpen,
    editingId,
    txnType,
    setTxnType,
    amount,
    setAmount,
    category,
    setCategory,
    note,
    setNote,
    date,
    setDate,
    walletId,
    setWalletId,
    toWalletId,
    setToWalletId,
    wallets,
    addWallet,
    updateWallet,
    deleteWallet,
    formError,
    openTransactionDialog,
    saveTransaction,
    deleteTransaction,
    undoDelete,
    // CSV Modal
    csvModalOpen,
    openCsvModal,
    closeCsvModal,
    handleCsvImport,
    // Actions
    updateBudget,
    selectCategoryFilter,
    // Toast
    toast,
    showToast,
  } = useExpenses()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleRequestLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
  }

  // Mandatory Auth Gate: Users must sign in or create an account first
  if (!user) {
    if (page === 'register') {
      return (
        <>
          <Register
            onRegisterSuccess={register}
            onNavigateToLogin={() => {
              window.location.hash = '#/login'
            }}
          />
          <div className="toast" id="toast" role="status" hidden={toast.hidden}>
            <span id="tmsg">{toast.message}</span>
          </div>
        </>
      )
    }

    return (
      <>
        <Login
          onLoginSuccess={login}
          onNavigateToRegister={() => {
            window.location.hash = '#/register'
          }}
        />
        <div className="toast" id="toast" role="status" hidden={toast.hidden}>
          <span id="tmsg">{toast.message}</span>
        </div>
      </>
    )
  }

  return (
    <MainLayout
      page={page}
      month={month}
      changeMonth={changeMonth}
      totalSpent={totalSpent}
      budget={budget}
      budgetPercent={budgetPercent}
      currency={currency}
      user={user}
      onLogout={handleRequestLogout}
      search={search}
      setSearch={setSearch}
      openTransactionDialog={openTransactionDialog}
      openCsvModal={openCsvModal}
      theme={theme}
      toggleTheme={toggleTheme}
      // Filter Drawer props
      isFilterDrawerOpen={isFilterDrawerOpen}
      openFilterDrawer={openFilterDrawer}
      closeFilterDrawer={closeFilterDrawer}
      activeFilterCount={activeFilterCount}
      totalFilteredCount={totalFilteredCount}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      walletFilter={walletFilter}
      setWalletFilter={setWalletFilter}
      minAmount={minAmount}
      setMinAmount={setMinAmount}
      maxAmount={maxAmount}
      setMaxAmount={setMaxAmount}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      paymentMethodFilter={paymentMethodFilter}
      setPaymentMethodFilter={setPaymentMethodFilter}
      resetFilters={resetFilters}
      // Transaction Form Dialog props
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      editingId={editingId}
      txnType={txnType}
      setTxnType={setTxnType}
      amount={amount}
      setAmount={setAmount}
      category={category}
      setCategory={setCategory}
      note={note}
      setNote={setNote}
      date={date}
      setDate={setDate}
      walletId={walletId}
      setWalletId={setWalletId}
      toWalletId={toWalletId}
      setToWalletId={setToWalletId}
      wallets={wallets}
      formError={formError}
      saveTransaction={saveTransaction}
      // CSV Import Modal props
      csvModalOpen={csvModalOpen}
      closeCsvModal={closeCsvModal}
      handleCsvImport={handleCsvImport}
      // Toast props
      toast={toast}
      undoDelete={undoDelete}
    >
      {page === 'dashboard' ? (
        <Dashboard
          transactions={transactions}
          monthTransactions={monthTransactions}
          totalIncome={totalIncome}
          totalSpent={totalSpent}
          netCashFlow={netCashFlow}
          wallets={wallets}
          currency={currency}
          month={month}
        />
      ) : page === 'insights' ? (
        <Insights
          totalSpent={totalSpent}
          totalIncome={totalIncome}
          netCashFlow={netCashFlow}
          budget={budget}
          budgetLeft={budgetLeft}
          budgetPercent={budgetPercent}
          month={month}
          daysLeft={daysLeft}
          isCurrentMonth={isCurrentMonth}
          categoryTotals={categoryTotals}
          rankedCategories={rankedCategories}
          incomeCategoryTotals={incomeCategoryTotals}
          rankedIncomeCategories={rankedIncomeCategories}
          last7Days={last7Days}
          activityLogs={activityLogs}
          wallets={wallets}
          currency={currency}
          onUpdateBudget={updateBudget}
          onSelectCategoryFilter={selectCategoryFilter}
        />
      ) : page === 'wallets' ? (
        <Wallets
          wallets={wallets}
          currency={currency}
          onAddWallet={addWallet}
          onUpdateWallet={updateWallet}
          onDeleteWallet={deleteWallet}
        />
      ) : page === 'settings' ? (
        <Settings
          user={user}
          onUserUpdate={onUserUpdate}
          onLogout={handleRequestLogout}
          theme={theme}
          setTheme={setTheme}
          currency={currency}
          setCurrency={setCurrency}
          budget={budget}
          onUpdateBudget={updateBudget}
          showToast={showToast}
        />
      ) : (
        <Transactions
          transactions={transactions}
          month={month}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          search={search}
          setSearch={setSearch}
          sort={sort}
          onSort={toggleSort}
          currency={currency}
          openTransactionDialog={openTransactionDialog}
          onDeleteTransaction={deleteTransaction}
          openCsvModal={openCsvModal}
          walletFilter={walletFilter}
          minAmount={minAmount}
          maxAmount={maxAmount}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          paymentMethodFilter={paymentMethodFilter}
          wallets={wallets}
        />
      )}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Pocket Ledger?"
        message="Are you sure you want to sign out of your account? You will need to sign back in with your credentials to access your ledger."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </MainLayout>
  )
}

export default App
