import React from 'react'
import './App.css'
import { useExpenses } from './hooks/useExpenses'
import { MainLayout } from './layouts/MainLayout'
import { Transactions } from './pages/Transactions'
import { Insights } from './pages/Insights'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

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

  // Full-page Login view
  if (page === 'login') {
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

  // Full-page Register view
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
    <MainLayout
      page={page}
      month={month}
      changeMonth={changeMonth}
      totalSpent={totalSpent}
      budget={budget}
      budgetPercent={budgetPercent}
      currency={currency}
      user={user}
      onLogout={logout}
      search={search}
      setSearch={setSearch}
      openTransactionDialog={openTransactionDialog}
      openCsvModal={openCsvModal}
      theme={theme}
      toggleTheme={toggleTheme}
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
      {page === 'insights' ? (
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
          currency={currency}
          onUpdateBudget={updateBudget}
          onSelectCategoryFilter={selectCategoryFilter}
        />
      ) : page === 'settings' ? (
        <Settings
          user={user}
          onUserUpdate={onUserUpdate}
          onLogout={logout}
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
        />
      )}
    </MainLayout>
  )
}

export default App
