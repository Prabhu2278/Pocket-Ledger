import React, { useState, useEffect } from 'react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, registerCategoryColors } from '../constants/categories'
import { money, CURRENCY_CONFIGS } from '../utils/formatCurrency'
import { categoryApi } from '../services/categoryApi'
import { CustomDropdown } from './ui/CustomDropdown/CustomDropdown'
import { CustomDatePicker } from './ui/CustomDatePicker/CustomDatePicker'

const RANDOM_CATEGORY_COLORS = [
  '#b42c45', // Crimson
  '#2563eb', // Royal Blue
  '#15803d', // Forest Emerald
  '#b45309', // Amber Brown
  '#0d7a6f', // Deep Teal
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#0284c7', // Sky Blue
  '#6366f1', // Indigo
  '#d97706', // Orange Amber
  '#059669', // Emerald
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#ea580c', // Burnt Orange
]

function getRandomCategoryColor() {
  const idx = Math.floor(Math.random() * RANDOM_CATEGORY_COLORS.length)
  return RANDOM_CATEGORY_COLORS[idx]
}

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
  const [randomCategoryColor, setRandomCategoryColor] = useState(() => getRandomCategoryColor())

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

  // Sync category mode ONLY when opening dialog or editing
  useEffect(() => {
    if (dialogOpen) {
      setRandomCategoryColor(getRandomCategoryColor())
      if (isEditing && category && category !== 'Transfer') {
        const isKnown = allCategoryList.some(
          (c) => c.toLowerCase() === category.toLowerCase()
        )
        if (!isKnown) {
          setIsCustomMode(true)
          setCustomCategoryInput(category)
          return
        }
      }
      setIsCustomMode(false)
      setCustomCategoryInput('')
    }
  }, [dialogOpen, isEditing])

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
    let categoryToSave = category
    let colorToSave = undefined

    if (isCustomMode) {
      const trimmed = customCategoryInput.trim()
      if (!trimmed) {
        setCategory('')
        saveTransaction(e)
        return
      }
      categoryToSave = trimmed
      colorToSave = randomCategoryColor || getRandomCategoryColor()

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

      // Immediately register the random color in client registry
      registerCategoryColors([{ name: trimmed, color: colorToSave }])

      // Persist custom category to backend database and Settings with random color and tag icon
      try {
        await categoryApi.createCategory({
          name: trimmed,
          type: type === 'income' ? 'income' : 'expense',
          color: colorToSave,
          icon: 'tag',
        })
      } catch (err) {
        console.warn('[TransactionForm] Category creation note:', err)
      }

      if (refreshCategories) {
        try {
          await refreshCategories()
        } catch {
          // ignore
        }
      }

      setCategory(trimmed)
    }

    saveTransaction(e, {
      category: categoryToSave,
      category_color: colorToSave,
    })
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
                <CustomDropdown
                  id="txn-from-wallet"
                  value={walletId || ''}
                  onChange={(val) => setWalletId && setWalletId(val)}
                  placeholder="-- Select Source Account --"
                  options={wallets.map((w) => {
                    const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                    return {
                      value: String(w.id),
                      label: `${w.name} (${money(bal, currency)})`,
                    }
                  })}
                  style={{ marginTop: '4px' }}
                />
              </label>

              <label>
                To Account (Destination)
                <CustomDropdown
                  id="txn-to-wallet"
                  value={toWalletId || ''}
                  onChange={(val) => setToWalletId && setToWalletId(val)}
                  placeholder="-- Select Destination Account --"
                  options={wallets.map((w) => {
                    const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                    return {
                      value: String(w.id),
                      label: `${w.name} (${money(bal, currency)})`,
                    }
                  })}
                  style={{ marginTop: '4px' }}
                />
              </label>
            </div>
          ) : (
            /* Single Account Selector for Expense or Income */
            <label>
              {type === 'income' ? 'Deposit Into Wallet / Account' : 'Pay From Wallet / Account'}
              <CustomDropdown
                id="txn-wallet"
                value={walletId || ''}
                onChange={(val) => setWalletId && setWalletId(val)}
                placeholder="-- Select Wallet / Account --"
                options={wallets.map((w) => {
                  const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
                  return {
                    value: String(w.id),
                    label: `${w.name} (${money(bal, currency)} available)`,
                  }
                })}
                style={{ marginTop: '4px' }}
              />
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
            <div style={{ display: 'grid', gap: '5px' }}>
              <label htmlFor="txn-category" style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
              <CustomDropdown
                id="txn-category"
                value={isCustomMode ? '__custom__' : category || ''}
                options={[
                  ...allCategoryList.map((catName) => ({
                    value: catName,
                    label: catName,
                  })),
                  { value: '__custom__', label: '+ Customize Category...' },
                ]}
                placeholder="-- Select Category --"
                onChange={(val) => {
                  if (val === '__custom__') {
                    setIsCustomMode(true)
                    setCategory(customCategoryInput.trim() || '')
                    setRandomCategoryColor(getRandomCategoryColor())
                  } else {
                    setIsCustomMode(false)
                    setCategory(val)
                  }
                }}
              />

              {/* Show input box when user chooses "Customize Category" */}
              {isCustomMode && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="txn-custom-category-input"
                      type="text"
                      maxLength={50}
                      placeholder="Enter new category name (e.g. Gym, Subscriptions, Pet Care)"
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
                        padding: '9px 12px 9px 36px',
                        borderRadius: 'var(--pl-radius-md)',
                        border: '1.5px solid var(--pl-color-primary)',
                        background: 'var(--pl-bg-surface)',
                        color: 'var(--pl-text-primary)',
                        fontSize: '13px',
                        minHeight: '38px',
                        height: '38px',
                      }}
                    />
                    {/* Random Color Dot Indicator */}
                    <span
                      title={`Randomly assigned icon color: ${randomCategoryColor}`}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: randomCategoryColor,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                    <small style={{ color: 'var(--pl-text-muted)', fontSize: '11px' }}>
                      Will be saved in Settings / Category and database with this random color.
                    </small>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: randomCategoryColor,
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: randomCategoryColor,
                          display: 'inline-block',
                        }}
                      />
                      Random color assigned
                    </span>
                  </div>
                </div>
              )}
            </div>
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
            <CustomDatePicker
              id="txn-date"
              value={date}
              onChange={(val) => setDate(val)}
              style={{ marginTop: '4px' }}
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
