import { useState, useEffect, useMemo, useCallback } from 'react'
import { transactionApi } from '../../services/transactionApi'

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
  const [data, setData] = useState({
    budget: 20000,
    tx: [],
    log: [],
  })

  const [sort, setSort] = useState({ key: 'date', direction: -1 })
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [lastDeleted, setLastDeleted] = useState(null)

  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Load transactions directly from PostgreSQL Database
  const fetchFromDb = useCallback(async () => {
    try {
      const records = await transactionApi.getTransactions({ month_key: monthKey })
      if (Array.isArray(records)) {
        setData((prev) => ({
          ...prev,
          tx: records.map((r) => ({
            ...r,
            amt: r.amount,
            cat: r.category,
          })),
        }))
      }
    } catch (err) {
      console.error('Failed to fetch transactions from DB:', err)
    }
  }, [monthKey])

  useEffect(() => {
    fetchFromDb()
  }, [fetchFromDb, currentUser])

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
      list = list.filter((t) => String(t.wallet_id) === String(selectedWallet))
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (t) =>
          (t.note || t.title || '').toLowerCase().includes(term) ||
          (t.cat || t.category || '').toLowerCase().includes(term)
      )
    }

    list.sort((a, b) => {
      let va = a[sort.key]
      let vb = b[sort.key]
      if (sort.key === 'amt' || sort.key === 'amount') {
        va = Number(a.amt || a.amount) || 0
        vb = Number(b.amt || b.amount) || 0
      } else if (sort.key === 'description' || sort.key === 'note') {
        va = (a.note || a.title || a.cat || a.category || '').toLowerCase()
        vb = (b.note || b.title || b.cat || b.category || '').toLowerCase()
      } else if (sort.key === 'category' || sort.key === 'cat') {
        va = (a.cat || a.category || '').toLowerCase()
        vb = (b.cat || b.category || '').toLowerCase()
      } else if (sort.key === 'wallet' || sort.key === 'wallet_name') {
        va = (a.wallet_name || '').toLowerCase()
        vb = (b.wallet_name || '').toLowerCase()
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

  const saveExpense = useCallback(async () => {
    const num = parseFloat(formSlice.amount)
    if (!formSlice.amount || isNaN(num) || num <= 0) {
      formSlice.setFormError('Please enter a valid amount')
      return
    }
    formSlice.setFormError('')

    const payload = {
      type: (formSlice.type || 'expense').toLowerCase(),
      amount: num,
      amt: num,
      category: formSlice.category,
      cat: formSlice.category,
      note: formSlice.note.trim() || formSlice.category,
      title: formSlice.note.trim() || formSlice.category,
      date: formSlice.date,
    }

    try {
      if (formSlice.editingId) {
        await transactionApi.updateTransaction(formSlice.editingId, payload.type, payload)
        showToast('Transaction updated in database')
      } else {
        await transactionApi.createTransaction(payload)
        showToast('Transaction saved to database')
      }
      await fetchFromDb()
    } catch (err) {
      showToast(err.message || 'Failed to save to database')
    }

    formSlice.setDialogOpen(false)
    formSlice.resetForm()
  }, [formSlice, fetchFromDb, showToast])

  const deleteExpense = useCallback(
    async (id, type = 'expense') => {
      const target = data.tx.find((t) => t.id === id)
      if (!target) return
      setLastDeleted(target)
      try {
        await transactionApi.deleteTransaction(id, (target.type || type).toLowerCase())
        showToast(`Removed "${target.note || target.title}" from database`, true)
        await fetchFromDb()
      } catch (err) {
        showToast('Failed to delete from database')
      }
      setDeleteConfirmId(null)
    },
    [data.tx, fetchFromDb, showToast]
  )

  const undoDelete = useCallback(async () => {
    if (!lastDeleted) return
    try {
      await transactionApi.createTransaction({
        type: (lastDeleted.type || 'expense').toLowerCase(),
        amount: lastDeleted.amount || lastDeleted.amt,
        category: lastDeleted.category || lastDeleted.cat,
        note: lastDeleted.note || lastDeleted.title || '',
        date: lastDeleted.date,
      })
      showToast('Transaction restored in database')
      await fetchFromDb()
    } catch (err) {
      console.error('Failed to restore:', err)
    }
    setLastDeleted(null)
  }, [lastDeleted, fetchFromDb, showToast])

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
    fetchFromDb,
  }
}

export default useExpensesSlice
