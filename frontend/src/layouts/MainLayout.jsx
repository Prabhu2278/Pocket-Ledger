import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { ExpenseForm } from '../components/ExpenseForm'

export function MainLayout({
  children,
  page,
  month,
  changeMonth,
  totalSpent,
  budget,
  budgetPercent,
  search,
  setSearch,
  openExpenseDialog,
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
      />

      <main>
        <Header
          page={page}
          search={search}
          setSearch={setSearch}
          openExpenseDialog={openExpenseDialog}
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
