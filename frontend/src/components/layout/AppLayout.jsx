import React from 'react'
import { Sidebar } from '../Sidebar'
import { Header } from '../Header'
import { TransactionForm } from '../TransactionForm'
import { CsvImportModal } from '../CsvImportModal'
import { FilterDrawer } from '../FilterDrawer'

export function AppLayout({
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
  // Filter Drawer props
  isFilterDrawerOpen,
  openFilterDrawer,
  closeFilterDrawer,
  activeFilterCount,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
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
  totalFilteredCount,
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
  walletId,
  setWalletId,
  toWalletId,
  setToWalletId,
  wallets,
  formError,
  saveTransaction,
  // CSV Import modal props
  csvModalOpen,
  closeCsvModal,
  handleCsvImport,
  addWallet,
  refreshWallets,
  // Toast props
  toast,
  showToast,
  undoDelete,
  // Categories props
  categories = [],
  expenseCategories = [],
  incomeCategories = [],
  refreshCategories,
}) {
  return (
    <div className="shell">
      {/* Global Ambient Backdrop for all pages */}
      <div className="shell-ambient-backdrop" aria-hidden="true">
        <div className="shell-ambient-orb orb-1" />
        <div className="shell-ambient-orb orb-2" />
        <div className="shell-ambient-orb orb-3" />
        <div className="shell-ambient-orb orb-4" />
        <div className="shell-grid-overlay" />
      </div>

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
          month={month}
          changeMonth={changeMonth}
          search={search}
          setSearch={setSearch}
          openTransactionDialog={openTransactionDialog}
          openCsvModal={openCsvModal}
          theme={theme}
          toggleTheme={toggleTheme}
          openFilterDrawer={openFilterDrawer}
          isFilterDrawerOpen={isFilterDrawerOpen}
          activeFilterCount={activeFilterCount}
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
        walletId={walletId}
        setWalletId={setWalletId}
        toWalletId={toWalletId}
        setToWalletId={setToWalletId}
        wallets={wallets}
        currency={currency}
        formError={formError}
        saveTransaction={saveTransaction}
        categories={categories}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        refreshCategories={refreshCategories}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={closeCsvModal}
        onImportConfirm={handleCsvImport}
        currency={currency}
        wallets={wallets}
        categories={categories}
        refreshCategories={refreshCategories}
        showToast={showToast}
        addWallet={addWallet}
        refreshWallets={refreshWallets}
      />

      {/* Filter Drawer (Right Side Slide-Over) */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={closeFilterDrawer}
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
        wallets={wallets}
        currency={currency}
        totalFilteredCount={totalFilteredCount}
        activeFilterCount={activeFilterCount}
        onResetFilters={resetFilters}
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

export default AppLayout
