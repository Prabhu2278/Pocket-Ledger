import React from 'react'
import './App.css'
import { useExpenses } from './hooks/useExpenses'
import { MainLayout } from './layouts/MainLayout'
import { Expenses } from './pages/Expenses'
import { Insights } from './pages/Insights'

export function App() {
  const {
    month,
    changeMonth,
    page,
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
    toast,
  } = useExpenses()

  return (
    <MainLayout
      page={page}
      month={month}
      changeMonth={changeMonth}
      totalSpent={totalSpent}
      budget={budget}
      budgetPercent={budgetPercent}
      search={search}
      setSearch={setSearch}
      openExpenseDialog={openExpenseDialog}
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
      toast={toast}
      undoDelete={undoDelete}
    >
      {page === 'insights' ? (
        <Insights
          totalSpent={totalSpent}
          budget={budget}
          budgetLeft={budgetLeft}
          budgetPercent={budgetPercent}
          month={month}
          daysLeft={daysLeft}
          isCurrentMonth={isCurrentMonth}
          categoryTotals={categoryTotals}
          rankedCategories={rankedCategories}
          last7Days={last7Days}
          activityLogs={activityLogs}
          onUpdateBudget={updateBudget}
          onSelectCategoryFilter={selectCategoryFilter}
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
          onSort={toggleSort}
          openExpenseDialog={openExpenseDialog}
          onDeleteExpense={deleteExpense}
        />
      )}
    </MainLayout>
  )
}

export default App
