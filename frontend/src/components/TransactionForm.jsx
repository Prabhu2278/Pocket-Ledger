import React from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { money } from '../utils/formatCurrency'

export function TransactionForm({
  dialogOpen,
  setDialogOpen,
  editingId,
  type = 'expense',
  setType,
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
  wallets = [],
  currency = 'INR',
  formError,
  saveTransaction,
}) {
  if (!dialogOpen) return null

  const isEditing = editingId !== null
  const isTransfer = type === 'transfer'
  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // Find currently selected source wallet
  const selectedWallet =
    wallets.find((w) => String(w.id) === String(walletId)) || wallets[0]
  const walletBalance = Number(
    selectedWallet?.current_balance ?? selectedWallet?.balance ?? selectedWallet?.initial_balance ?? 0
  )

  // Find destination wallet for transfers
  const selectedToWallet =
    wallets.find((w) => String(w.id) === String(toWalletId)) ||
    wallets.find((w) => String(w.id) !== String(selectedWallet?.id)) ||
    wallets[1] ||
    null

  const numericAmount = parseFloat(amount) || 0
  const isInsufficient = (type === 'expense' || isTransfer) && selectedWallet && numericAmount > walletBalance
  const isSameWallet = isTransfer && selectedWallet && selectedToWallet && String(selectedWallet.id) === String(selectedToWallet.id)
  const isBlocked = isInsufficient || isSameWallet || (isTransfer && wallets.length < 2)

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="txn-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDialogOpen(false)
      }}
    >
      <div className="dialog-content">
        <form className="f" onSubmit={saveTransaction} noValidate>
          <h2 id="txn-dialog-title">
            {isEditing
              ? `Edit ${isTransfer ? 'Transfer' : type}`
              : isTransfer
              ? 'Transfer Money Between Wallets'
              : 'Add Transaction'}
          </h2>

          {/* Type Selector Chips: Expense | Income | Transfer */}
          {!isEditing && (
            <div
              className="chips"
              role="radiogroup"
              aria-label="Transaction Type"
              style={{ marginBottom: '8px', display: 'flex', gap: '6px' }}
            >
              <button
                type="button"
                className="chip"
                aria-pressed={type === 'expense'}
                onClick={() => {
                  setType('expense')
                  setCategory('Food')
                }}
              >
                Expense
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={type === 'income'}
                onClick={() => {
                  setType('income')
                  setCategory('Salary')
                }}
              >
                Income
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={type === 'transfer'}
                onClick={() => {
                  setType('transfer')
                  setCategory('Transfer')
                  if (!toWalletId && wallets.length > 1) {
                    const otherWallet = wallets.find((w) => String(w.id) !== String(selectedWallet?.id))
                    if (otherWallet) setToWalletId(String(otherWallet.id))
                  }
                }}
              >
                ⇄ Transfer
              </button>
            </div>
          )}

          {/* Transfer Accounts Selection: From -> To */}
          {isTransfer ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '4px 0' }}>
              <label>
                From Account (Source)
                <select
                  id="txn-from-wallet"
                  value={walletId || (selectedWallet ? selectedWallet.id : '')}
                  onChange={(e) => setWalletId && setWalletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--card)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {wallets.map((w) => {
                    const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                    return (
                      <option key={`from-${w.id}`} value={w.id}>
                        {w.name} ({money(bal, currency)})
                      </option>
                    )
                  })}
                </select>
              </label>

              <label>
                To Account (Destination)
                <select
                  id="txn-to-wallet"
                  value={toWalletId || (selectedToWallet ? selectedToWallet.id : '')}
                  onChange={(e) => setToWalletId && setToWalletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--card)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {wallets.map((w) => {
                    const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                    return (
                      <option key={`to-${w.id}`} value={w.id}>
                        {w.name} ({money(bal, currency)})
                      </option>
                    )
                  })}
                </select>
              </label>
            </div>
          ) : (
            /* Single Account Selector for Expense or Income */
            <label>
              {type === 'income' ? 'Deposit Into Wallet / Account' : 'Pay From Wallet / Account'}
              <select
                id="txn-wallet"
                value={walletId || (selectedWallet ? selectedWallet.id : '')}
                onChange={(e) => setWalletId && setWalletId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--card)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '4px',
                  cursor: 'pointer',
                }}
              >
                {wallets.length === 0 ? (
                  <option value="">Default Wallet</option>
                ) : (
                  wallets.map((w) => {
                    const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                    return (
                      <option key={w.id} value={w.id}>
                        {w.name} ({money(bal, currency)} available)
                      </option>
                    )
                  })
                )}
              </select>
            </label>
          )}

          {/* Transfer Minimum Accounts Warning */}
          {isTransfer && wallets.length < 2 && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid var(--warn)',
                color: 'var(--warn)',
                fontSize: '12.5px',
                fontWeight: 600,
                margin: '4px 0',
              }}
            >
              ⚠️ You need at least 2 accounts to make a transfer. Please add another account in the Wallets tab first.
            </div>
          )}

          {/* Same Account Warning */}
          {isSameWallet && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--out)',
                color: 'var(--out)',
                fontSize: '12.5px',
                fontWeight: 600,
                margin: '4px 0',
              }}
              role="alert"
            >
              ⚠️ Source and Destination accounts cannot be the same. Please choose different accounts.
            </div>
          )}

          <label>
            {isTransfer ? 'Transfer Amount' : 'Amount'}
            <input
              className="amount"
              id="txn-amt"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="₹0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </label>

          {/* Real-time Insufficient Balance Warning Banner */}
          {isInsufficient && (
            <div
              id="txn-insufficient-alert"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--out)',
                color: 'var(--out)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '6px 0 2px',
              }}
              role="alert"
            >
              <span aria-hidden="true" style={{ fontSize: '16px' }}>⚠️</span>
              <span>
                Low Balance! Available in <b>{selectedWallet.name}</b> is {money(walletBalance, currency)}. You cannot {isTransfer ? 'transfer' : 'spend'} {money(numericAmount, currency)}.
              </span>
            </div>
          )}

          {/* Category Chips (Only shown for Expense and Income) */}
          {!isTransfer && (
            <>
              <label style={{ margin: '6px 0 2px', fontSize: '13px', fontWeight: 600 }}>Category</label>
              <div className="chips" role="group" aria-label="Category Selection">
                {activeCategories.map(([catName]) => (
                  <button
                    key={catName}
                    type="button"
                    className="chip"
                    aria-pressed={category === catName}
                    onClick={() => setCategory(catName)}
                  >
                    {catName}
                  </button>
                ))}
              </div>
            </>
          )}

          <label>
            Description / Note
            <input
              id="txn-note"
              type="text"
              maxLength={80}
              placeholder={
                isTransfer
                  ? `e.g. Transfer to ${selectedToWallet?.name || 'savings'}, ATM withdrawal`
                  : type === 'income'
                  ? 'e.g. Monthly salary, Client retainer'
                  : 'What was it for? (optional)'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label>
            Date
            <input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {formError && (
            <p className="err" id="txn-err" role="alert">
              {formError}
            </p>
          )}

          <div className="btns">
            <button
              type="button"
              className="ghost"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              className="primary"
              type="submit"
              disabled={isBlocked}
              style={{
                opacity: isBlocked ? 0.5 : 1,
                cursor: isBlocked ? 'not-allowed' : 'pointer',
              }}
              title={
                isSameWallet
                  ? 'Source and Destination accounts must be different'
                  : isInsufficient
                  ? 'Insufficient funds in source account'
                  : undefined
              }
            >
              {isEditing
                ? 'Save changes'
                : isTransfer
                ? 'Confirm Transfer'
                : `Save ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionForm
