import { useState, useCallback } from 'react'

export function useTransactionForm(wallets = []) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [type, setType] = useState('EXPENSE')
  const [walletId, setWalletId] = useState(1)
  const [toWalletId, setToWalletId] = useState('')
  const [formError, setFormError] = useState('')

  const resetForm = useCallback(() => {
    setEditingId(null)
    setAmount('')
    setCategory('Food')
    setNote('')
    setDate(new Date().toISOString().slice(0, 10))
    setType('EXPENSE')
    setWalletId(wallets[0]?.id || 1)
    setToWalletId('')
    setFormError('')
  }, [wallets])

  const openForEdit = useCallback((tx) => {
    setEditingId(tx.id)
    setAmount(String(tx.amt || tx.amount || ''))
    setCategory(tx.cat || tx.category || 'Food')
    setNote(tx.note || '')
    setDate(tx.date ? tx.date.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setType(tx.type || 'EXPENSE')
    setWalletId(tx.wallet_id || 1)
    setToWalletId(tx.to_wallet_id || '')
    setDialogOpen(true)
  }, [])

  return {
    dialogOpen,
    setDialogOpen,
    editingId,
    setEditingId,
    amount,
    setAmount,
    category,
    setCategory,
    note,
    setNote,
    date,
    setDate,
    type,
    setType,
    walletId,
    setWalletId,
    toWalletId,
    setToWalletId,
    formError,
    setFormError,
    resetForm,
    openForEdit,
  }
}
