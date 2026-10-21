import React from 'react'
import './App.css'
import { useExpenses } from './hooks/useExpenses'
import { MainLayout } from './layouts/MainLayout'
import { Expenses } from './pages/Expenses'
import { Income } from './pages/Income'
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
    setPage,
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
    // Expenses
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    toggleSort,
    budget,
    totalSpent,
    budgetLeft,
    budgetPercent,
    monthTransactions,
    visibleTransactions,
    categoryTotals,
    rankedCategories,
    daysLeft,
    isCurrentMonth,
    last7Days,
    activityLogs,
    dialogOpen,
    setDialogOpen,
    editingId,
    amount,
    setAmount,
    category,
    setCategory,
    note,
    setNote,
    date,
    setDate,
    formError,
    openExpenseDialog,
    saveExpense,
    deleteExpense,
    undoDelete,
    updateBudget,
    selectCategoryFilter,
    // Income
    incomeFilter,
    setIncomeFilter,
    incomeSearch,
    setIncomeSearch,
    incomeSort,
    toggleIncomeSort,
    monthIncomes,
    visibleIncomes,
    totalIncome,
    netCashFlow,
    incomeCategoryTotals,
    rankedIncomeCategories,
    incomeDialogOpen,
    setIncomeDialogOpen,
    editingIncomeId,
    incomeAmount,
    setIncomeAmount,
    incomeCategory,
    setIncomeCategory,
    incomeNote,
    setIncomeNote,
    incomeDate,
    setIncomeDate,
    incomeFormError,
    openIncomeDialog,
    saveIncome,
    deleteIncome,
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
      incomeSearch={incomeSearch}
      setIncomeSearch={setIncomeSearch}
      openExpenseDialog={openExpenseDialog}
      openIncomeDialog={openIncomeDialog}
      theme={theme}
      toggleTheme={toggleTheme}
      // Expense Dialog props
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      editingId={editingId}
      amount={amount}
      setAmount={setAmount}
      category={category}
      setCategory={setCategory}
      note={note}
      setNote={setNote}
      date={date}
      setDate={setDate}
      formError={formError}
      saveExpense={saveExpense}
      // Income Dialog props
      incomeDialogOpen={incomeDialogOpen}
      setIncomeDialogOpen={setIncomeDialogOpen}
      editingIncomeId={editingIncomeId}
      incomeAmount={incomeAmount}
      setIncomeAmount={setIncomeAmount}
      incomeCategory={incomeCategory}
      setIncomeCategory={setIncomeCategory}
      incomeNote={incomeNote}
      setIncomeNote={setIncomeNote}
      incomeDate={incomeDate}
      setDate={setIncomeDate}
      formError={incomeFormError}
      saveIncome={saveIncome}
      // Toast props
      toast={toast}
      undoDelete={undoDelete}
    >
      {page === 'income' ? (
        <Income
          totalIncome={totalIncome}
          monthIncomes={monthIncomes}
          rankedIncomeCategories={rankedIncomeCategories}
          filter={incomeFilter}
          setFilter={setIncomeFilter}
          visibleIncomes={visibleIncomes}
          sort={incomeSort}
          currency={currency}
          onSort={toggleIncomeSort}
          openIncomeDialog={openIncomeDialog}
          onDeleteIncome={deleteIncome}
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
        <Expenses
          totalSpent={totalSpent}
          budgetLeft={budgetLeft}
          monthTransactions={monthTransactions}
          rankedCategories={rankedCategories}
          filter={filter}
          setFilter={setFilter}
          visibleTransactions={visibleTransactions}
          sort={sort}
          currency={currency}
          onSort={toggleSort}
          openExpenseDialog={openExpenseDialog}
          onDeleteExpense={deleteExpense}
        />
      )}
    </MainLayout>
  )
}

export default App
