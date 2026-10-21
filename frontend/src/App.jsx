import React from 'react'
import './App.css'
import { useExpenses } from './hooks/useExpenses'
import { MainLayout } from './layouts/MainLayout'
import { Expenses } from './pages/transactions/Expenses'
import { Insights } from './pages/Insights'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

export function App() {
  const {
    data,
    month,
    changeMonth,
    page,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    sortBy,
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
    deleteConfirmId,
    setDeleteConfirmId,
    deleteExpense,
    undoDelete,
    toast,
    monthTransactions,
    categoryTotals,
    totalSpent,
    budgetLeft,
    budgetPercent,
    rankedCategories,
    visibleTransactions,
    setBudget,
  } = useExpenses()

  return (
    <MainLayout
      page={page}
      month={month}
      changeMonth={changeMonth}
      totalSpent={totalSpent}
      budget={data.budget}
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
      deleteConfirmId={deleteConfirmId}
      setDeleteConfirmId={setDeleteConfirmId}
      deleteExpense={deleteExpense}
      toast={toast}
      undoDelete={undoDelete}
    >
      {page === 'expenses' && (
        <Expenses
          transactions={data.tx}
          monthTransactions={monthTransactions}
          totalSpent={totalSpent}
          budgetLeft={budgetLeft}
          rankedCategories={rankedCategories}
          onEdit={openExpenseDialog}
          onDelete={(id) => setDeleteConfirmId(id)}
        />
      )}

      {page === 'insights' && (
        <Insights
          totalSpent={totalSpent}
          budget={data.budget}
          budgetLeft={budgetLeft}
          budgetPercent={budgetPercent}
          categoryTotals={categoryTotals}
          rankedCategories={rankedCategories}
          data={data}
          setBudget={setBudget}
        />
      )}

      {page === 'dashboard' && (
        <Dashboard
          totalSpent={totalSpent}
          budget={data.budget}
          budgetLeft={budgetLeft}
          budgetPercent={budgetPercent}
          monthTransactions={monthTransactions}
          rankedCategories={rankedCategories}
          visibleTransactions={visibleTransactions}
          sort={sort}
          sortBy={sortBy}
          openExpenseDialog={openExpenseDialog}
          setDeleteConfirmId={setDeleteConfirmId}
        />
      )}

      {page === 'settings' && (
        <Settings showToast={(msg) => alert(msg)} />
      )}
    </MainLayout>
  )
}

export default App
