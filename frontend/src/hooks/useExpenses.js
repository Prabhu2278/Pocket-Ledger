import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { isoDate } from '../utils/dateUtils'
import { expenseApi } from '../services/expenseApi'

export function useExpenses() {
  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  // Hash-based routing matching prototype #/expenses and #/insights
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('insights')) return 'insights'
      return 'expenses'
    }
    return 'expenses'
  })

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', direction: -1 })

  // Data state
  const [transactions, setTransactions] = useState([])
  const [budget, setBudgetState] = useState(20000)
  const [activityLogs, setActivityLogs] = useState([])
  const [insightsSummary, setInsightsSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => isoDate(new Date()))
  const [formError, setFormError] = useState('')

  // Toast & Undo
  const [toast, setToast] = useState({ message: '', undo: false, hidden: true })
  const lastDeletedRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Listen to hash change
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('insights')) {
        setPage('insights')
      } else {
        setPage('expenses')
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const showToast = useCallback((message, undo = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, undo, hidden: false })
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, hidden: true }))
    }, 5000)
  }, [])

  // Load from FastAPI backend
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [items, budgetResp, insightsResp] = await Promise.allSettled([
        expenseApi.getExpenses({ month_key: monthKey }),
        expenseApi.getBudget(monthKey),
        expenseApi.getInsights(monthKey),
      ])

      if (items.status === 'fulfilled' && Array.isArray(items.value)) {
        setTransactions(items.value)
      }

      if (budgetResp.status === 'fulfilled' && budgetResp.value) {
        setBudgetState(Number(budgetResp.value.target_amount || budgetResp.value.budget || 20000))
      }

      if (insightsResp.status === 'fulfilled' && insightsResp.value) {
        setInsightsSummary(insightsResp.value)
        if (insightsResp.value.recent_activity) {
          setActivityLogs(insightsResp.value.recent_activity)
        }
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err)
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter transactions for current view month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = t.spent_on || t.date
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [transactions, month])

  const categoryTotals = useMemo(() => {
    const totals = {}
    monthTransactions.forEach((t) => {
      const c = t.cat || t.category || 'Other'
      const val = Number(t.amt || t.amount || 0)
      totals[c] = (totals[c] || 0) + val
    })
    return totals
  }, [monthTransactions])

  const totalSpent = useMemo(() => {
    return monthTransactions.reduce((acc, t) => acc + Number(t.amt || t.amount || 0), 0)
  }, [monthTransactions])

  const budgetLeft = budget - totalSpent

  const budgetPercent = useMemo(() => {
    return budget > 0 ? totalSpent / budget : 0
  }, [budget, totalSpent])

  const rankedCategories = useMemo(() => {
    return Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])
  }, [categoryTotals])

  const isCurrentMonth = month.year === now.getFullYear() && month.month === now.getMonth()
  const daysInMonth = useMemo(() => new Date(month.year, month.month + 1, 0).getDate(), [month])
  const daysLeft = isCurrentMonth ? Math.max(daysInMonth - now.getDate(), 1) : 'Closed'

  // Last 7 days daily calculation
  const last7Days = useMemo(() => {
    if (insightsSummary && insightsSummary.last_7_days && insightsSummary.last_7_days.length > 0) {
      return insightsSummary.last_7_days
    }
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const k = isoDate(d)
      const tot = transactions
        .filter((t) => (t.spent_on || t.date) === k)
        .reduce((sum, t) => sum + Number(t.amt || t.amount || 0), 0)
      days.push({
        index: i,
        date: k,
        day_name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        amount: tot,
        is_today: i === 0,
      })
    }
    return days
  }, [insightsSummary, transactions])

  // Filtered and sorted transactions
  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = monthTransactions.filter((t) => {
      const c = t.cat || t.category || 'Other'
      const n = t.note || t.title || ''
      const matchesFilter = filter === 'All' || c.toLowerCase() === filter.toLowerCase()
      const matchesSearch = !query || `${n} ${c}`.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })

    return rows.sort((a, b) => {
      if (sort.key === 'amt' || sort.key === 'amount') {
        const valA = Number(a.amt || a.amount || 0)
        const valB = Number(b.amt || b.amount || 0)
        return (valA - valB) * sort.direction
      }
      const dateA = a.spent_on || a.date || ''
      const dateB = b.spent_on || b.date || ''
      const comp = dateA.localeCompare(dateB) || a.id - b.id
      return comp * sort.direction
    })
  }, [monthTransactions, filter, search, sort])

  // Month navigation
  const changeMonth = useCallback((delta) => {
    setMonth((curr) => {
      const nextDate = new Date(curr.year, curr.month + delta, 1)
      return {
        year: nextDate.getFullYear(),
        month: nextDate.getMonth(),
      }
    })
  }, [])

  // Sorting toggle
  const toggleSort = useCallback((key) => {
    setSort((curr) => {
      if (curr.key === key) {
        return { key, direction: -curr.direction }
      }
      return { key, direction: -1 }
    })
  }, [])

  // Open Add/Edit dialog
  const openExpenseDialog = useCallback((item = null) => {
    if (item) {
      setEditingId(item.id)
      setAmount(String(item.amt || item.amount || ''))
      setCategory(item.cat || item.category || 'Food')
      setNote(item.note || item.title || '')
      setDate(item.spent_on || item.date || isoDate(new Date()))
    } else {
      setEditingId(null)
      setAmount('')
      setCategory('Food')
      setNote('')
      setDate(isoDate(new Date()))
    }
    setFormError('')
    setDialogOpen(true)
  }, [])

  // Save Expense (Create or Update)
  const saveExpense = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault()
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setFormError('Enter an amount greater than 0.')
        return
      }
      if (!date) {
        setFormError('Pick a date.')
        return
      }

      try {
        const payload = {
          amt: numericAmount,
          cat: category,
          note: note.trim(),
          date,
        }

        if (editingId) {
          await expenseApi.updateExpense(editingId, payload)
          showToast('Changes saved', false)
        } else {
          await expenseApi.createExpense(payload)
          showToast('Expense added', false)
        }

        // Adjust month view if date is in a different month
        const [y, m] = date.split('-').map(Number)
        setMonth({ year: y, month: m - 1 })
        setDialogOpen(false)
        await loadData()
      } catch (err) {
        setFormError(err.message || 'Error saving expense.')
      }
    },
    [amount, category, note, date, editingId, loadData, showToast]
  )

  // Delete Expense
  const deleteExpense = useCallback(
    async (id) => {
      const target = transactions.find((t) => t.id === id)
      if (!target) return

      try {
        await expenseApi.deleteExpense(id)
        lastDeletedRef.current = target
        showToast('Expense deleted', true)
        await loadData()
      } catch (err) {
        showToast('Failed to delete expense', false)
      }
    },
    [transactions, loadData, showToast]
  )

  // Undo delete
  const undoDelete = useCallback(async () => {
    if (!lastDeletedRef.current) return
    const toRestore = lastDeletedRef.current
    lastDeletedRef.current = null
    try {
      await expenseApi.createExpense({
        amt: toRestore.amt || toRestore.amount,
        cat: toRestore.cat || toRestore.category,
        note: toRestore.note || toRestore.title || '',
        date: toRestore.spent_on || toRestore.date,
      })
      setToast((prev) => ({ ...prev, hidden: true }))
      await loadData()
    } catch (err) {
      console.error('Failed to restore expense:', err)
    }
  }, [loadData])

  // Update budget
  const updateBudget = useCallback(
    async (newBudget) => {
      try {
        setBudgetState(newBudget)
        await expenseApi.setBudget(monthKey, newBudget)
      } catch (err) {
        console.error('Failed to update budget:', err)
      }
    },
    [monthKey]
  )

  // Filter category from Insights
  const selectCategoryFilter = useCallback(
    (cat) => {
      setFilter(cat)
      window.location.hash = '#/expenses'
      showToast(`Showing ${cat} only`, false)
    },
    [showToast]
  )

  return {
    month,
    changeMonth,
    page,
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    toggleSort,
    loading,
    budget,
    totalSpent,
    budgetLeft,
    budgetPercent,
    monthTransactions,
    visibleTransactions,
    categoryTotals,
    rankedCategories,
    daysLeft,
    isCurrentMonth,
    last7Days,
    activityLogs,
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
    openExpenseDialog,
    saveExpense,
    deleteExpense,
    undoDelete,
    updateBudget,
    selectCategoryFilter,
    toast,
  }
}

export default useExpenses
