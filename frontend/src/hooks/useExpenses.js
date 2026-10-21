import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { isoDate } from '../utils/dateUtils'
import { expenseApi } from '../services/expenseApi'
import { incomeApi } from '../services/incomeApi'
import { authApi } from '../services/authApi'

export function useExpenses() {
  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  // Hash-based routing matching prototype #/expenses, #/income, #/insights, #/settings, #/login, #/register
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('income')) return 'income'
      if (hash.includes('insights')) return 'insights'
      if (hash.includes('settings')) return 'settings'
      if (hash.includes('register')) return 'register'
      if (hash.includes('login')) return 'login'
      return 'expenses'
    }
    return 'expenses'
  })

  // Theme state
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pocket_ledger_theme') || 'dark'
    }
    return 'dark'
  })

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('pocket_ledger_theme', newTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  // User Auth state
  const [user, setUser] = useState(() => authApi.getUser())

  // Currency state
  const [currency, setCurrencyState] = useState(() => {
    const savedUser = authApi.getUser()
    if (savedUser?.currency) return savedUser.currency
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pocket_ledger_currency') || 'INR'
    }
    return 'INR'
  })

  const setCurrency = useCallback((curr) => {
    setCurrencyState(curr)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pocket_ledger_currency', curr)
    }
  }, [])

  // Expenses filters & sorting
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', direction: -1 })

  // Income filters & sorting
  const [incomeFilter, setIncomeFilter] = useState('All')
  const [incomeSearch, setIncomeSearch] = useState('')
  const [incomeSort, setIncomeSort] = useState({ key: 'date', direction: -1 })

  // Data state
  const [transactions, setTransactions] = useState([])
  const [incomes, setIncomes] = useState([])
  const [budget, setBudgetState] = useState(20000)
  const [activityLogs, setActivityLogs] = useState([])
  const [insightsSummary, setInsightsSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  // Expense Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => isoDate(new Date()))
  const [formError, setFormError] = useState('')

  // Income Dialog state
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [editingIncomeId, setEditingIncomeId] = useState(null)
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeCategory, setIncomeCategory] = useState('Salary')
  const [incomeNote, setIncomeNote] = useState('')
  const [incomeDate, setIncomeDate] = useState(() => isoDate(new Date()))
  const [incomeFormError, setIncomeFormError] = useState('')

  // Toast & Undo
  const [toast, setToast] = useState({ message: '', undo: false, hidden: true })
  const lastDeletedRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Listen to hash changes
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('income')) setPage('income')
      else if (hash.includes('insights')) setPage('insights')
      else if (hash.includes('settings')) setPage('settings')
      else if (hash.includes('register')) setPage('register')
      else if (hash.includes('login')) setPage('login')
      else setPage('expenses')
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

  // Sync current user on mount
  useEffect(() => {
    authApi
      .getMe()
      .then((me) => {
        if (me) {
          setUser(me)
          if (me.currency) setCurrencyState(me.currency)
        }
      })
      .catch(() => {})
  }, [])

  // Load from FastAPI backend (Expenses, Incomes, Budget, Insights)
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [items, incomeItems, budgetResp, insightsResp] = await Promise.allSettled([
        expenseApi.getExpenses({ month_key: monthKey }),
        incomeApi.getIncomes({ month_key: monthKey }),
        expenseApi.getBudget(monthKey),
        expenseApi.getInsights(monthKey),
      ])

      if (items.status === 'fulfilled' && Array.isArray(items.value)) {
        setTransactions(items.value)
      }

      if (incomeItems.status === 'fulfilled' && Array.isArray(incomeItems.value)) {
        setIncomes(incomeItems.value)
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

  // --- Expenses Calculations ---
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

  // --- Income Calculations ---
  const monthIncomes = useMemo(() => {
    return incomes.filter((t) => {
      const d = t.received_on || t.date
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [incomes, month])

  const incomeCategoryTotals = useMemo(() => {
    const totals = {}
    monthIncomes.forEach((t) => {
      const c = t.cat || t.category || 'Salary'
      const val = Number(t.amt || t.amount || 0)
      totals[c] = (totals[c] || 0) + val
    })
    return totals
  }, [monthIncomes])

  const totalIncome = useMemo(() => {
    return monthIncomes.reduce((acc, t) => acc + Number(t.amt || t.amount || 0), 0)
  }, [monthIncomes])

  const netCashFlow = useMemo(() => {
    return totalIncome - totalSpent
  }, [totalIncome, totalSpent])

  const rankedIncomeCategories = useMemo(() => {
    return Object.keys(incomeCategoryTotals).sort(
      (a, b) => incomeCategoryTotals[b] - incomeCategoryTotals[a]
    )
  }, [incomeCategoryTotals])

  const visibleIncomes = useMemo(() => {
    const query = incomeSearch.trim().toLowerCase()
    const rows = monthIncomes.filter((t) => {
      const c = t.cat || t.category || 'Other'
      const n = t.note || t.title || ''
      const matchesFilter = incomeFilter === 'All' || c.toLowerCase() === incomeFilter.toLowerCase()
      const matchesSearch = !query || `${n} ${c}`.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })

    return rows.sort((a, b) => {
      if (incomeSort.key === 'amt' || incomeSort.key === 'amount') {
        const valA = Number(a.amt || a.amount || 0)
        const valB = Number(b.amt || b.amount || 0)
        return (valA - valB) * incomeSort.direction
      }
      const dateA = a.received_on || a.date || ''
      const dateB = b.received_on || b.date || ''
      const comp = dateA.localeCompare(dateB) || a.id - b.id
      return comp * incomeSort.direction
    })
  }, [monthIncomes, incomeFilter, incomeSearch, incomeSort])

  // --- Insights / Calendar Info ---
  const isCurrentMonth = month.year === now.getFullYear() && month.month === now.getMonth()
  const daysInMonth = useMemo(() => new Date(month.year, month.month + 1, 0).getDate(), [month])
  const daysLeft = isCurrentMonth ? Math.max(daysInMonth - now.getDate(), 1) : 'Closed'

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

  // Sorting toggles
  const toggleSort = useCallback((key) => {
    setSort((curr) => {
      if (curr.key === key) {
        return { key, direction: -curr.direction }
      }
      return { key, direction: -1 }
    })
  }, [])

  const toggleIncomeSort = useCallback((key) => {
    setIncomeSort((curr) => {
      if (curr.key === key) {
        return { key, direction: -curr.direction }
      }
      return { key, direction: -1 }
    })
  }, [])

  // Open Expense Dialog
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

  // Save Expense
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

  // Undo delete expense
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

  // Open Income Dialog
  const openIncomeDialog = useCallback((item = null) => {
    if (item) {
      setEditingIncomeId(item.id)
      setIncomeAmount(String(item.amt || item.amount || ''))
      setIncomeCategory(item.cat || item.category || 'Salary')
      setIncomeNote(item.note || item.title || '')
      setIncomeDate(item.received_on || item.date || isoDate(new Date()))
    } else {
      setEditingIncomeId(null)
      setIncomeAmount('')
      setIncomeCategory('Salary')
      setIncomeNote('')
      setIncomeDate(isoDate(new Date()))
    }
    setIncomeFormError('')
    setIncomeDialogOpen(true)
  }, [])

  // Save Income
  const saveIncome = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault()
      const numericAmount = parseFloat(incomeAmount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setIncomeFormError('Enter an amount greater than 0.')
        return
      }
      if (!incomeDate) {
        setIncomeFormError('Pick a date.')
        return
      }

      try {
        const payload = {
          amt: numericAmount,
          cat: incomeCategory,
          note: incomeNote.trim(),
          date: incomeDate,
        }

        if (editingIncomeId) {
          await incomeApi.updateIncome(editingIncomeId, payload)
          showToast('Income updated', false)
        } else {
          await incomeApi.createIncome(payload)
          showToast('Income added', false)
        }

        const [y, m] = incomeDate.split('-').map(Number)
        setMonth({ year: y, month: m - 1 })
        setIncomeDialogOpen(false)
        await loadData()
      } catch (err) {
        setIncomeFormError(err.message || 'Error saving income.')
      }
    },
    [incomeAmount, incomeCategory, incomeNote, incomeDate, editingIncomeId, loadData, showToast]
  )

  // Delete Income
  const deleteIncome = useCallback(
    async (id) => {
      const target = incomes.find((t) => t.id === id)
      if (!target) return

      try {
        await incomeApi.deleteIncome(id)
        showToast('Income deleted', false)
        await loadData()
      } catch (err) {
        showToast('Failed to delete income', false)
      }
    },
    [incomes, loadData, showToast]
  )

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

  // Auth actions
  const handleLogin = useCallback(
    (userData) => {
      setUser(userData)
      if (userData.currency) setCurrencyState(userData.currency)
      showToast(`Welcome back, ${userData.name || userData.full_name || userData.email}!`)
      window.location.hash = '#/expenses'
      loadData()
    },
    [loadData, showToast]
  )

  const handleLogout = useCallback(() => {
    authApi.logout()
    setUser(null)
    showToast('Signed out of Pocket Ledger')
    window.location.hash = '#/login'
    loadData()
  }, [loadData, showToast])

  const handleRegister = useCallback(
    (userData) => {
      setUser(userData)
      if (userData.currency) setCurrencyState(userData.currency)
      showToast(`Account created! Welcome, ${userData.name || userData.full_name || userData.email}!`)
      window.location.hash = '#/expenses'
      loadData()
    },
    [loadData, showToast]
  )

  const handleUserUpdate = useCallback((updatedUser) => {
    setUser(updatedUser)
    if (updatedUser.currency) setCurrencyState(updatedUser.currency)
  }, [])

  return {
    month,
    changeMonth,
    page,
    setPage,
    // Theme
    theme,
    setTheme,
    toggleTheme,
    // Currency
    currency,
    setCurrency,
    // Auth
    user,
    setUser,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    onUserUpdate: handleUserUpdate,
    // Expenses
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
    // Incomes
    incomes,
    incomeFilter,
    setIncomeFilter,
    incomeSearch,
    setIncomeSearch,
    incomeSort,
    toggleIncomeSort,
    monthIncomes,
    visibleIncomes,
    totalIncome,
    netCashFlow,
    incomeCategoryTotals,
    rankedIncomeCategories,
    incomeDialogOpen,
    setIncomeDialogOpen,
    editingIncomeId,
    incomeAmount,
    setIncomeAmount,
    incomeCategory,
    setIncomeCategory,
    incomeNote,
    setIncomeNote,
    incomeDate,
    setIncomeDate,
    incomeFormError,
    openIncomeDialog,
    saveIncome,
    deleteIncome,
    // Toast
    toast,
    showToast,
  }
}

export default useExpenses
