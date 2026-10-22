import React, { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { money, CURRENCY_CONFIGS } from '../utils/formatCurrency'
import { categoryApi } from '../services/categoryApi'

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
  categories = [],
  expenseCategories = [],
  incomeCategories = [],
  refreshCategories,
}) {
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('pocket_ledger_custom_categories')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')

  // Scroll Lock: disable background/outside scrolling when modal is open
  useEffect(() => {
    if (dialogOpen) {
      document.body.classList.add('modal-open')
      document.documentElement.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [dialogOpen])

  const isEditing = editingId !== null
  const isTransfer = type === 'transfer'

  // Database-backed categories integration
  const dbCategories = (type === 'income' ? incomeCategories : expenseCategories) || []
  const standardList = dbCategories.length > 0
    ? dbCategories.filter((c) => c.is_default).map((c) => c.name)
    : (type === 'income' ? INCOME_CATEGORIES.map((c) => c[0]) : EXPENSE_CATEGORIES.map((c) => c[0]))

  const dbCustomList = dbCategories.filter((c) => !c.is_default).map((c) => c.name)
  const combinedCustom = Array.from(new Set([...customCategories, ...dbCustomList]))
  const allCategoryList = Array.from(new Set([...standardList, ...combinedCustom]))

  // Currency symbol
  const currCode = (currency || 'INR').toUpperCase()
  const currSymbol = CURRENCY_CONFIGS[currCode]?.symbol || '₹'

  // Sync category mode when editing or opening
  useEffect(() => {
    if (dialogOpen) {
      if (category && category !== 'Transfer') {
        const isKnown = allCategoryList.some(
          (c) => c.toLowerCase() === category.toLowerCase()
        )
        if (!isKnown) {
          setIsCustomMode(true)
          setCustomCategoryInput(category)
        } else {
          setIsCustomMode(false)
          setCustomCategoryInput('')
        }
      } else {
        setIsCustomMode(false)
        setCustomCategoryInput('')
      }
    }
  }, [dialogOpen, category, allCategoryList])

  if (!dialogOpen) return null

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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (isCustomMode && customCategoryInput.trim()) {
      const trimmed = customCategoryInput.trim()
      setCustomCategories((prev) => {
        if (!prev.includes(trimmed)) {
          const updated = [...prev, trimmed]
          try {
            localStorage.setItem('pocket_ledger_custom_categories', JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        }
        return prev
      })
      // Persist custom category to backend database
      categoryApi.createCategory({
        name: trimmed,
        type: type === 'income' ? 'income' : 'expense',
      }).then(() => {
        if (refreshCategories) refreshCategories()
      }).catch(() => {})

      setCategory(trimmed)
    }
    saveTransaction(e)
  }

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
        <form className="f" onSubmit={handleSubmit} noValidate>
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
                  setCategory('')
                  setIsCustomMode(false)
                  setCustomCategoryInput('')
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
                  setCategory('')
                  setIsCustomMode(false)
                  setCustomCategoryInput('')
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
                  setIsCustomMode(false)
                  setCustomCategoryInput('')
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
                  value={walletId || ''}
                  onChange={(e) => setWalletId && setWalletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 'var(--pl-radius-md)',
                    border: '1px solid var(--pl-border-default)',
                    background: 'var(--pl-bg-surface)',
                    color: 'var(--pl-text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select Source Account --</option>
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
                  value={toWalletId || ''}
                  onChange={(e) => setToWalletId && setToWalletId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 'var(--pl-radius-md)',
                    border: '1px solid var(--pl-border-default)',
                    background: 'var(--pl-bg-surface)',
                    color: 'var(--pl-text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select Destination Account --</option>
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
                value={walletId || ''}
                onChange={(e) => setWalletId && setWalletId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--pl-radius-md)',
                  border: '1px solid var(--pl-border-default)',
                  background: 'var(--pl-bg-surface)',
                  color: 'var(--pl-text-primary)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  marginTop: '4px',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- Select Wallet / Account --</option>
                {wallets.map((w) => {
                  const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                  return (
                    <option key={w.id} value={w.id}>
                      {w.name} ({money(bal, currency)} available)
                    </option>
                  )
                })}
              </select>
            </label>
          )}

          {/* Transfer Minimum Accounts Warning */}
          {isTransfer && wallets.length < 2 && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--pl-radius-md)',
                background: 'var(--pl-color-warning-soft)',
                border: '1px solid var(--pl-color-warning)',
                color: 'var(--pl-color-warning)',
                fontSize: '12.5px',
                fontWeight: 600,
                margin: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>You need at least 2 accounts to make a transfer. Please add another account in the Wallets tab first.</span>
            </div>
          )}

          {/* Same Account Warning */}
          {isSameWallet && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--pl-radius-md)',
                background: 'var(--pl-color-danger-soft)',
                border: '1px solid var(--pl-color-danger)',
                color: 'var(--pl-color-danger)',
                fontSize: '12.5px',
                fontWeight: 600,
                margin: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="alert"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Source and Destination accounts cannot be the same. Please choose different accounts.</span>
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
              placeholder={`${currSymbol}0`}
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
                borderRadius: 'var(--pl-radius-md)',
                background: 'var(--pl-color-danger-soft)',
                border: '1px solid var(--pl-color-danger)',
                color: 'var(--pl-color-danger)',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '6px 0 2px',
              }}
              role="alert"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                Low Balance! Available in <b>{selectedWallet.name}</b> is {money(walletBalance, currency)}. You cannot {isTransfer ? 'transfer' : 'spend'} {money(numericAmount, currency)}.
              </span>
            </div>
          )}

          {/* Category Dropdown (Shown for Expense and Income) */}
          {!isTransfer && (
            <label style={{ display: 'grid', gap: '5px' }}>
              Category
              <select
                id="txn-category"
                value={isCustomMode ? '__custom__' : category || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '__custom__') {
                    setIsCustomMode(true)
                    setCategory(customCategoryInput.trim() || '')
                  } else {
                    setIsCustomMode(false)
                    setCategory(val)
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--pl-radius-md)',
                  border: '1px solid var(--pl-border-default)',
                  background: 'var(--pl-bg-surface)',
                  color: 'var(--pl-text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '38px',
                  height: '38px',
                }}
              >
                <option value="">-- Select Category --</option>
                <optgroup label="Categories">
                  {allCategoryList.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </optgroup>
                <option value="__custom__">+ Customize Category...</option>
              </select>

              {/* Show input box when user chooses "Customize Category" */}
              {isCustomMode && (
                <div style={{ marginTop: '6px' }}>
                  <input
                    id="txn-custom-category-input"
                    type="text"
                    placeholder="Enter custom category name (e.g. Gym, Subscriptions, Pet Care)"
                    value={customCategoryInput}
                    onChange={(e) => {
                      const val = e.target.value
                      setCustomCategoryInput(val)
                      setCategory(val)
                    }}
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--pl-radius-md)',
                      border: '1px solid var(--pl-color-primary)',
                      background: 'var(--pl-bg-surface)',
                      color: 'var(--pl-text-primary)',
                      fontSize: '13px',
                      minHeight: '38px',
                      height: '38px',
                    }}
                  />
                  <small style={{ color: 'var(--pl-text-muted)', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                    This category will be saved to your custom category list.
                  </small>
                </div>
              )}
            </label>
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
