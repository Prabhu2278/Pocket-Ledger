import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { TransactionForm } from '../components/TransactionForm'
import { CsvImportModal } from '../components/CsvImportModal'

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
  openTransactionDialog,
  openCsvModal,
  theme,
  toggleTheme,
  // Transaction Form modal props
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
  saveTransaction,
  // CSV Import modal props
  csvModalOpen,
  closeCsvModal,
  handleCsvImport,
  // Toast props
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
          openTransactionDialog={openTransactionDialog}
          openCsvModal={openCsvModal}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {children}
      </main>

      {/* Add / Edit Transaction Dialog */}
      <TransactionForm
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        editingId={editingId}
        type={txnType}
        setType={setTxnType}
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
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={closeCsvModal}
        onImportConfirm={handleCsvImport}
        currency={currency}
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
