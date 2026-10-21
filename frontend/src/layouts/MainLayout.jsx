import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { ExpenseForm } from '../components/ExpenseForm'
import { IncomeForm } from '../components/IncomeForm'

export function MainLayout({
  children,
  page,
  month,
  changeMonth,
  totalSpent,
  budget,
  budgetPercent,
  currency,
  user,
  onLogout,
  search,
  setSearch,
  incomeSearch,
  setIncomeSearch,
  openExpenseDialog,
  openIncomeDialog,
  theme,
  toggleTheme,
  // Expense Form
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
  saveExpense,
  // Income Form
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
  saveIncome,
  // Toast
  toast,
  undoDelete,
}) {
  return (
    <div className="shell">
      <Sidebar
        page={page}
        month={month}
        changeMonth={changeMonth}
        totalSpent={totalSpent}
        budget={budget}
        budgetPercent={budgetPercent}
        currency={currency}
        user={user}
        onLogout={onLogout}
      />

      <main>
        <Header
          page={page}
          search={search}
          setSearch={setSearch}
          incomeSearch={incomeSearch}
          setIncomeSearch={setIncomeSearch}
          openExpenseDialog={openExpenseDialog}
          openIncomeDialog={openIncomeDialog}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {children}
      </main>

      {/* Add / Edit Expense Dialog */}
      <ExpenseForm
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
      />

      {/* Add / Edit Income Dialog */}
      <IncomeForm
        dialogOpen={incomeDialogOpen}
        setDialogOpen={setIncomeDialogOpen}
        editingId={editingIncomeId}
        amount={incomeAmount}
        setAmount={setIncomeAmount}
        category={incomeCategory}
        setCategory={setIncomeCategory}
        note={incomeNote}
        setNote={setIncomeNote}
        date={incomeDate}
        setDate={setIncomeDate}
        formError={incomeFormError}
        saveIncome={saveIncome}
      />

      {/* Toast Notification with Undo */}
      <div className="toast" id="toast" role="status" hidden={toast.hidden}>
        <span id="tmsg">{toast.message}</span>
        {toast.undo && (
          <button id="undo" type="button" onClick={undoDelete}>
            Undo
          </button>
        )}
      </div>
    </div>
  )
}

export default MainLayout
