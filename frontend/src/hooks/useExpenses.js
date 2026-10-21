import { useState, useEffect, useMemo, useCallback } from 'react'
import { isoDate } from '../utils/dateUtils'
import { expenseApi } from '../services/expenseApi'

export const CATEGORIES = [
  ['Food', '#b42c45'],
  ['Transport', '#2563eb'],
  ['Home', '#0d7a6f'],
  ['Fun', '#9333ea'],
  ['Health', '#15803d'],
  ['Shopping', '#b45309'],
  ['Other', '#64748b'],
]

const STORAGE_KEY = 'pocket-ledger-web-v1'

function getInitialData() {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        // Fallback
      }
    }
  }
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  return {
    budget: 45000,
    tx: [
      { id: 1, amt: 850, cat: 'Food', date: `${y}-${m}-04`, note: 'Grocery haul' },
      { id: 2, amt: 2200, cat: 'Transport', date: `${y}-${m}-06`, note: 'Monthly metro pass' },
      { id: 3, amt: 3400, cat: 'Home', date: `${y}-${m}-10`, note: 'Kitchen supplies' },
      { id: 4, amt: 1200, cat: 'Fun', date: `${y}-${m}-12`, note: 'Movie night with friends' },
      { id: 5, amt: 750, cat: 'Health', date: `${y}-${m}-15`, note: 'Pharmacy' },
      { id: 6, amt: 2800, cat: 'Shopping', date: `${y}-${m}-18`, note: 'Winter jacket' },
    ],
    log: [
      { t: Date.now() - 3600000 * 24, txt: 'Added "Winter jacket" (Shopping)' },
      { t: Date.now() - 3600000 * 48, txt: 'Added "Pharmacy" (Health)' },
    ],
  }
}

export function useExpenses() {
  const [data, setData] = useState(getInitialData)
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('expenses')) return 'expenses'
      if (hash.includes('insights')) return 'insights'
      if (hash.includes('settings')) return 'settings'
      if (hash.includes('dashboard')) return 'dashboard'
    }
    return 'expenses'
  })

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', direction: -1 })

  // Dialog state for adding/editing expense
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => isoDate(new Date()))
  const [formError, setFormError] = useState('')

  // Delete confirm dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [toast, setToast] = useState({ message: '', undo: false, hidden: true })
  const [lastDeleted, setLastDeleted] = useState(null)

  // Listen to hash route changes
  useEffect(() => {
    function handleRoute() {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('expenses')) setPage('expenses')
      else if (hash.includes('insights')) setPage('insights')
      else if (hash.includes('settings')) setPage('settings')
      else if (hash.includes('dashboard')) setPage('dashboard')
    }
    window.addEventListener('hashchange', handleRoute)
    return () => window.removeEventListener('hashchange', handleRoute)
  }, [])

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      // Storage full
    }
  }, [data])

  // Sync with FastAPI backend if available
  useEffect(() => {
    async function fetchBackend() {
      try {
        const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`
        const items = await expenseApi.getExpenses({ month_key: monthKey })
        if (items && items.length > 0) {
          setData((prev) => {
            const mapped = items.map((i) => ({
              id: i.id,
              amt: i.amount || i.amt,
              cat: i.category || i.cat,
              date: i.date || i.spent_on,
              note: i.notes || i.note || '',
            }))
            // Merge with local items that are not in backend
            const merged = [...prev.tx]
            for (const m of mapped) {
              const idx = merged.findIndex((x) => x.id === m.id)
              if (idx >= 0) merged[idx] = m
              else merged.push(m)
            }
            return { ...prev, tx: merged }
          })
        }
      } catch (err) {
        // Backend offline, fallback seamlessly to localStorage
      }
    }
    fetchBackend()
  }, [month])

  // Filter transactions for current month
  const monthTransactions = useMemo(() => {
    return data.tx.filter((item) => {
      if (!item.date) return false
      const [y, m] = item.date.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [data.tx, month])

  const categoryTotals = useMemo(() => {
    const totals = {}
    monthTransactions.forEach((item) => {
      totals[item.cat] = (totals[item.cat] || 0) + Number(item.amt)
    })
    return totals
  }, [monthTransactions])

  const totalSpent = useMemo(() => {
    return monthTransactions.reduce((total, item) => total + Number(item.amt), 0)
  }, [monthTransactions])

  const budgetLeft = Number(data.budget) - totalSpent

  const budgetPercent = useMemo(() => {
    return Number(data.budget) > 0 ? Math.min(totalSpent / Number(data.budget), 1) : 0
  }, [data.budget, totalSpent])

  const rankedCategories = useMemo(() => {
    return Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])
  }, [categoryTotals])

  const daysInMonth = useMemo(() => {
    return new Date(month.year, month.month + 1, 0).getDate()
  }, [month])

  const currentMonth = month.year === today.getFullYear() && month.month === today.getMonth()
  const daysLeft = currentMonth ? Math.max(daysInMonth - today.getDate(), 1) : 1

  const visibleTransactions = useMemo(() => {
    const rows = monthTransactions.filter((item) => {
      const matchesCategory = filter === 'All' || item.cat === filter
      const matchesSearch = `${item.note || ''} ${item.cat || ''}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })

    return rows.sort((a, b) => {
      const comparison =
        sort.key === 'amt'
          ? a.amt - b.amt
          : a.date.localeCompare(b.date) || a.id - b.id
      return comparison * sort.direction
    })
  }, [monthTransactions, filter, search, sort])

  const logActivity = useCallback((message) => {
    setData((current) => ({
      ...current,
      log: [{ t: Date.now(), txt: message }, ...current.log].slice(0, 30),
    }))
  }, [])

  const showToast = useCallback((message, undo = false) => {
    setToast({ message, undo, hidden: false })
    setTimeout(() => {
      setToast((t) => ({ ...t, hidden: true }))
    }, 4000)
  }, [])

  const changeMonth = useCallback((offset) => {
    setMonth((current) => {
      const next = new Date(current.year, current.month + offset, 1)
      return {
        year: next.getFullYear(),
        month: next.getMonth(),
      }
    })
  }, [])

  const openExpenseDialog = useCallback((item = null) => {
    setEditingId(item?.id ?? null)
    setCategory(item?.cat ?? 'Food')
    setAmount(item ? String(item.amt) : '')
    setNote(item?.note ?? '')
    setDate(item?.date ?? isoDate(new Date()))
    setFormError('')
    setDialogOpen(true)
  }, [])

  const saveExpense = useCallback(
    async (event) => {
      if (event && event.preventDefault) event.preventDefault()
      const numericAmount = Number(amount)
      if (!numericAmount || numericAmount <= 0) {
        setFormError('Please enter an amount greater than ₹0')
        return
      }

      if (editingId !== null) {
        // Update existing expense
        setData((current) => ({
          ...current,
          tx: current.tx.map((item) =>
            item.id === editingId
              ? { ...item, amt: numericAmount, cat: category, note: note.trim(), date }
              : item
          ),
        }))
        logActivity(`Updated ${category} expense (${numericAmount})`)
        showToast('Expense updated')
        // Async update to backend
        expenseApi.updateExpense(editingId, {
          amount: numericAmount,
          category,
          date,
          notes: note.trim(),
        }).catch(() => {})
      } else {
        // Add new expense
        const newId = Date.now()
        const newRecord = {
          id: newId,
          amt: numericAmount,
          cat: category,
          note: note.trim(),
          date,
        }
        setData((current) => ({
          ...current,
          tx: [newRecord, ...current.tx],
        }))
        logActivity(`Added ${category} expense (${numericAmount})`)
        showToast('Expense added')
        // Async create to backend
        expenseApi.createExpense({
          title: note.trim() || `${category} Expense`,
          amount: numericAmount,
          category,
          date,
          notes: note.trim(),
        }).catch(() => {})
      }

      setDialogOpen(false)
    },
    [amount, category, note, date, editingId, logActivity, showToast]
  )

  const deleteExpense = useCallback(
    (id) => {
      const target = data.tx.find((item) => item.id === id)
      if (!target) return
      setLastDeleted(target)
      setData((current) => ({
        ...current,
        tx: current.tx.filter((item) => item.id !== id),
      }))
      logActivity(`Deleted ${target.cat} expense (${target.amt})`)
      showToast('Expense deleted', true)
      setDeleteConfirmId(null)
      // Async delete to backend
      expenseApi.deleteExpense(id).catch(() => {})
    },
    [data.tx, logActivity, showToast]
  )

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return
    setData((current) => ({
      ...current,
      tx: [lastDeleted, ...current.tx],
    }))
    logActivity(`Restored ${lastDeleted.cat} expense`)
    setLastDeleted(null)
    setToast((t) => ({ ...t, hidden: true }))
  }, [lastDeleted, logActivity])

  const sortBy = useCallback((key) => {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 1 ? -1 : 1 }
      }
      return { key, direction: -1 }
    })
  }, [])

  const setBudget = useCallback(
    (newBudget) => {
      const val = Number(newBudget) || 0
      setData((curr) => ({ ...curr, budget: val }))
      const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`
      expenseApi.setBudget(monthKey, val).catch(() => {})
      logActivity(`Budget changed to ₹${val}`)
      showToast('Budget updated')
    },
    [month, logActivity, showToast]
  )

  return {
    data,
    setData,
    month,
    setMonth,
    changeMonth,
    page,
    setPage,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    sortBy,
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
    setFormError,
    openExpenseDialog,
    saveExpense,
    deleteConfirmId,
    setDeleteConfirmId,
    deleteExpense,
    undoDelete,
    toast,
    setToast,
    monthTransactions,
    categoryTotals,
    totalSpent,
    budgetLeft,
    budgetPercent,
    rankedCategories,
    daysLeft,
    visibleTransactions,
    setBudget,
  }
}
