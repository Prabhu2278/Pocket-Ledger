import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { ExpenseForm } from '../components/ExpenseForm'
import { ConfirmDialog } from '../components/ConfirmDialog'

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
  deleteConfirmId,
  setDeleteConfirmId,
  deleteExpense,
  toast,
  undoDelete,
}) {
  return (
    <div className="pocket-ledger-app">
      <Sidebar
        page={page}
        month={month}
        changeMonth={changeMonth}
        totalSpent={totalSpent}
        budget={budget}
        budgetPercent={budgetPercent}
      />

      <main className="pocket-ledger-main">
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

      {/* Delete Expense Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Delete this expense?"
        message="This will remove the transaction from your ledger."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => deleteExpense(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Global Toast Notification */}
      {!toast.hidden && (
        <aside
          className="pocket-ledger-toast"
          role="status"
          aria-live="polite"
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              className="pocket-ledger-ghost-button"
              onClick={undoDelete}
              style={{ color: 'var(--pocket-accent)', fontWeight: 700 }}
            >
              Undo
            </button>
          )}
        </aside>
      )}
    </div>
  )
}

export default MainLayout
