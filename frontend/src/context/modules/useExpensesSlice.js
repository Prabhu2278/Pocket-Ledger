import { useState, useEffect, useMemo, useCallback } from 'react'
import { INITIAL_TRANSACTIONS } from '../../utils/initialData'
import { transactionApi } from '../../api/transactionApi'

const STORAGE_KEY = 'pocket-ledger-web-v1'

export function useExpensesSlice({
  currentUser,
  wallets = [],
  setWallets = () => {},
  computedWallets = [],
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
  setMonth = () => {},
  filterSlice = {},
  formSlice = {},
  showToast = () => {},
}) {
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch (e) {}
      }
    }
    return {
      budget: 45000,
      tx: INITIAL_TRANSACTIONS,
      log: [],
    }
  })

  const [sort, setSort] = useState({ key: 'date', direction: -1 })
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [lastDeleted, setLastDeleted] = useState(null)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {}
  }, [data])

  // Month transactions calculation
  const monthTransactions = useMemo(() => {
    const { year, month: m } = month
    const prefix = `${year}-${String(m + 1).padStart(2, '0')}`
    return (data.tx || []).filter((item) => (item.date || '').startsWith(prefix))
  }, [data.tx, month])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let list = [...monthTransactions]
    const { filter = 'All', typeFilter = 'ALL', search = '', selectedWallet = 'all' } = filterSlice

    if (filter !== 'All') {
      list = list.filter((t) => (t.cat || t.category) === filter)
    }
    if (typeFilter !== 'ALL') {
      list = list.filter((t) => (t.type || 'EXPENSE').toUpperCase() === typeFilter)
    }
    if (selectedWallet !== 'all') {
      list = list.filter((t) => t.wallet_id === Number(selectedWallet) || t.to_wallet_id === Number(selectedWallet))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          (t.note || t.title || '').toLowerCase().includes(q) ||
          (t.cat || t.category || '').toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      let va = a[sort.key]
      let vb = b[sort.key]
      if (sort.key === 'amount') {
        va = Number(a.amt || a.amount) || 0
        vb = Number(b.amt || b.amount) || 0
      }
      if (va < vb) return -1 * sort.direction
      if (va > vb) return 1 * sort.direction
      return 0
    })

    return list
  }, [monthTransactions, filterSlice, sort])

  // Financial aggregates
  const totalSpent = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || 'EXPENSE').toUpperCase() === 'EXPENSE')
      .reduce((sum, t) => sum + (Number(t.amt || t.amount) || 0), 0)
  }, [monthTransactions])

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toUpperCase() === 'INCOME')
      .reduce((sum, t) => sum + (Number(t.amt || t.amount) || 0), 0)
  }, [monthTransactions])

  const categoryTotals = useMemo(() => {
    const map = {}
    monthTransactions
      .filter((t) => (t.type || 'EXPENSE').toUpperCase() === 'EXPENSE')
      .forEach((t) => {
        const cat = t.cat || t.category || 'Other'
        map[cat] = (map[cat] || 0) + (Number(t.amt || t.amount) || 0)
      })
    return map
  }, [monthTransactions])

  const topCategory = useMemo(() => {
    let top = { name: '—', amount: 0 }
    Object.entries(categoryTotals).forEach(([name, amount]) => {
      if (amount > top.amount) top = { name, amount }
    })
    return top
  }, [categoryTotals])

  const saveExpense = useCallback(() => {
    const num = parseFloat(formSlice.amount)
    if (!formSlice.amount || isNaN(num) || num <= 0) {
      formSlice.setFormError('Please enter a valid amount')
      return
    }
    formSlice.setFormError('')

    const payload = {
      amount: num,
      category: formSlice.category,
      note: formSlice.note.trim() || formSlice.category,
      date: formSlice.date,
      type: formSlice.type,
      wallet_id: Number(formSlice.walletId) || 1,
      to_wallet_id: formSlice.toWalletId ? Number(formSlice.toWalletId) : null,
    }

    if (formSlice.editingId) {
      setData((prev) => ({
        ...prev,
        tx: prev.tx.map((t) => (t.id === formSlice.editingId ? { ...t, ...payload, amt: num, cat: formSlice.category } : t)),
        log: [{ t: Date.now(), txt: `Updated "${payload.note}"` }, ...prev.log.slice(0, 19)],
      }))
      showToast('Transaction updated')
    } else {
      const newEntry = { ...payload, id: Date.now(), amt: num, cat: formSlice.category }
      setData((prev) => ({
        ...prev,
        tx: [newEntry, ...prev.tx],
        log: [{ t: Date.now(), txt: `Added "${payload.note}" (${payload.category})` }, ...prev.log.slice(0, 19)],
      }))
      showToast('Transaction added')
    }

    formSlice.setDialogOpen(false)
    formSlice.resetForm()
  }, [formSlice, showToast])

  const deleteExpense = useCallback((id) => {
    const target = data.tx.find((t) => t.id === id)
    if (!target) return
    setLastDeleted(target)
    setData((prev) => ({
      ...prev,
      tx: prev.tx.filter((t) => t.id !== id),
      log: [{ t: Date.now(), txt: `Removed "${target.note || target.title}"` }, ...prev.log.slice(0, 19)],
    }))
    setDeleteConfirmId(null)
    showToast(`Removed "${target.note || target.title}"`, true)
  }, [data.tx, showToast])

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return
    setData((prev) => ({
      ...prev,
      tx: [lastDeleted, ...prev.tx],
      log: [{ t: Date.now(), txt: `Restored "${lastDeleted.note || lastDeleted.title}"` }, ...prev.log.slice(0, 19)],
    }))
    setLastDeleted(null)
    showToast('Transaction restored')
  }, [lastDeleted, showToast])

  return {
    data,
    setData,
    monthTransactions,
    filteredTransactions,
    totalSpent,
    totalIncome,
    categoryTotals,
    topCategory,
    sort,
    setSort,
    deleteConfirmId,
    setDeleteConfirmId,
    saveExpense,
    deleteExpense,
    undoDelete,
  }
}
