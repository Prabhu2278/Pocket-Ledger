import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { isoDate, normalizeDateStr } from '../utils/dateUtils'
import { transactionApi } from '../services/transactionApi'
import { expenseApi } from '../services/expenseApi'
import { authApi } from '../services/authApi'
import { walletApi } from '../services/walletApi'
import { settingsApi } from '../services/settingsApi'

export function useExpenses() {
  const now = useMemo(() => new Date(), [])
  const [month, setMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  // Hash-based routing: #/transactions, #/expenses, #/income, #/dashboard, #/wallets, #/settings, #/login, #/register
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('income')) return 'transactions'
      if (hash.includes('expenses')) return 'transactions'
      if (hash.includes('transactions')) return 'transactions'
      if (hash.includes('dashboard')) return 'dashboard'
      if (hash.includes('insights')) return 'insights'
      if (hash.includes('wallets')) return 'wallets'
      if (hash.includes('settings')) return 'settings'
      if (hash.includes('register')) return 'register'
      if (hash.includes('login')) return 'login'
      return 'dashboard'
    }
    return 'dashboard'
  })

  // Type filter for unified transactions view: 'all', 'income', 'expense'
  const [typeFilter, setTypeFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('income')) return 'income'
      if (hash.includes('expenses')) return 'expense'
    }
    return 'all'
  })

  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'date', direction: -1 })

  // Drawer & Advanced Filter state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [walletFilter, setWalletFilter] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')

  const resetFilters = useCallback(() => {
    setTypeFilter('all')
    setCategoryFilter('All')
    setWalletFilter('all')
    setMinAmount('')
    setMaxAmount('')
    setStartDate('')
    setEndDate('')
    setPaymentMethodFilter('all')
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (typeFilter && typeFilter !== 'all') count++
    if (categoryFilter && categoryFilter !== 'All') count++
    if (walletFilter && walletFilter !== 'all') count++
    if (minAmount !== '') count++
    if (maxAmount !== '') count++
    if (startDate !== '') count++
    if (endDate !== '') count++
    return count
  }, [
    typeFilter,
    categoryFilter,
    walletFilter,
    minAmount,
    maxAmount,
    startDate,
    endDate,
  ])

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
      document.body?.setAttribute('data-theme', newTheme)
      localStorage.setItem('pocket_ledger_theme', newTheme)
    }
    // Persist to database
    settingsApi.updateSettings({ theme: newTheme }).catch(() => {})
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      document.body?.setAttribute('data-theme', theme)
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
    // Persist to database
    settingsApi.updateSettings({ currency: curr }).catch(() => {})
    if (authApi.getUser()) {
      authApi.updateProfile({ currency: curr }).catch(() => {})
    }
  }, [])

  // Synchronize settings with database on startup or auth changes
  useEffect(() => {
    let isMounted = true
    async function syncRemoteSettings() {
      try {
        const remote = await settingsApi.getSettings()
        if (remote && isMounted) {
          if (remote.theme) {
            setThemeState(remote.theme)
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', remote.theme)
              document.body?.setAttribute('data-theme', remote.theme)
              localStorage.setItem('pocket_ledger_theme', remote.theme)
            }
          }
          if (remote.currency) {
            setCurrencyState(remote.currency)
            if (typeof window !== 'undefined') {
              localStorage.setItem('pocket_ledger_currency', remote.currency)
            }
          }
        }
      } catch {
        // silent fallback to localStorage
      }
    }
    syncRemoteSettings()
    return () => { isMounted = false }
  }, [user])

  // Unified Data state
  const [transactions, setTransactions] = useState([])
  const [budget, setBudgetState] = useState(20000)
  const [activityLogs, setActivityLogs] = useState([])
  const [insightsSummary, setInsightsSummary] = useState(null)
  const [wallets, setWallets] = useState([])
  const [walletId, setWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [loading, setLoading] = useState(false)

  // Unified Transaction Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [txnType, setTxnType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => isoDate(new Date()))
  const [formError, setFormError] = useState('')

  // CSV Import Modal state
  const [csvModalOpen, setCsvModalOpen] = useState(false)

  // Toast & Undo
  const [toast, setToast] = useState({ message: '', undo: false, hidden: true })
  const lastDeletedRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`

  // Listen to hash changes
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('income')) {
        setPage('transactions')
        setTypeFilter('income')
      } else if (hash.includes('expenses')) {
        setPage('transactions')
        setTypeFilter('expense')
      } else if (hash.includes('transactions')) {
        setPage('transactions')
        setTypeFilter('all')
      } else if (hash.includes('dashboard')) {
        setPage('dashboard')
      } else if (hash.includes('insights')) {
        setPage('insights')
      } else if (hash.includes('wallets')) {
        setPage('wallets')
      } else if (hash.includes('settings')) {
        setPage('settings')
      } else if (hash.includes('register')) {
        setPage('register')
      } else if (hash.includes('login')) {
        setPage('login')
      } else {
        setPage('dashboard')
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

  // Sync user profile on mount
  useEffect(() => {
    authApi
      .getMe()
      .then((me) => {
        if (me) {
          setUser(me)
          if (me.currency) setCurrencyState(me.currency)
        }
      })
      .catch(() => { })
  }, [])

  // Load from FastAPI backend (Unified Transactions across all months, Budget, Insights, Wallets)
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [txsResp, budgetResp, insightsResp, walletsResp] = await Promise.allSettled([
        transactionApi.getTransactions({ limit: 5000 }),
        expenseApi.getBudget(monthKey),
        expenseApi.getInsights(monthKey),
        walletApi.getWallets(),
      ])

      if (txsResp.status === 'fulfilled' && Array.isArray(txsResp.value)) {
        setTransactions(txsResp.value)
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

      if (walletsResp.status === 'fulfilled' && Array.isArray(walletsResp.value)) {
        setWallets(walletsResp.value)
        setWalletId((prev) => {
          if (prev && walletsResp.value.some((w) => String(w.id) === String(prev))) {
            return prev
          }
          return walletsResp.value.length > 0 ? String(walletsResp.value[0].id) : ''
        })
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

  // Month-scoped transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = normalizeDateStr(t.date || t.spent_on || t.received_on)
      if (!d) return false
      const [y, m] = d.split('-').map(Number)
      return y === month.year && m === month.month + 1
    })
  }, [transactions, month])

  // Live count of transactions matching active filter criteria (for the Filter Drawer Apply button)
  const totalFilteredCount = useMemo(() => {
    // If custom date range is set, query across all transactions; otherwise query monthTransactions
    let rows = (startDate || endDate) ? transactions : monthTransactions
    const normStart = normalizeDateStr(startDate)
    const normEnd = normalizeDateStr(endDate)

    // 1. Type filter
    if (typeFilter && typeFilter !== 'all') {
      const tf = typeFilter.toLowerCase()
      rows = rows.filter((t) => (t.type || '').toLowerCase() === tf)
    }

    // 2. Category filter
    if (categoryFilter && categoryFilter !== 'All') {
      rows = rows.filter((t) => (t.category || t.cat) === categoryFilter)
    }

    // 3. Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((t) => {
        const text = `${t.note || t.title || ''} ${t.category || t.cat || ''} ${t.type || ''}`.toLowerCase()
        return text.includes(q)
      })
    }

    // 4. Wallet filter
    if (walletFilter && walletFilter !== 'all') {
      const wId = String(walletFilter)
      rows = rows.filter((t) => String(t.wallet_id) === wId || String(t.to_wallet_id) === wId)
    }

    // 5. Date range (can span previous months or next months)
    if (normStart) {
      rows = rows.filter((t) => {
        const d = normalizeDateStr(t.date || t.spent_on || t.received_on)
        return d >= normStart
      })
    }
    if (normEnd) {
      rows = rows.filter((t) => {
        const d = normalizeDateStr(t.date || t.spent_on || t.received_on)
        return d <= normEnd
      })
    }

    // 6. Min / Max Amount
    if (minAmount !== '' && !isNaN(Number(minAmount))) {
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) >= Number(minAmount))
    }
    if (maxAmount !== '' && !isNaN(Number(maxAmount))) {
      rows = rows.filter((t) => Number(t.amount || t.amt || 0) <= Number(maxAmount))
    }

    return rows.length
  }, [
    transactions,
    monthTransactions,
    startDate,
    endDate,
    typeFilter,
    categoryFilter,
    search,
    walletFilter,
    minAmount,
    maxAmount,
  ])

  // Total Income
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .reduce((acc, t) => acc + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  // Total Expenses
  const totalSpent = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'expense')
      .reduce((acc, t) => acc + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  // Total Transfers
  const totalTransfers = useMemo(() => {
    return monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'transfer')
      .reduce((acc, t) => acc + Number(t.amount || t.amt || 0), 0)
  }, [monthTransactions])

  // Net Cash Flow
  const netCashFlow = useMemo(() => {
    return totalIncome - totalSpent
  }, [totalIncome, totalSpent])

  const budgetLeft = budget - totalSpent

  const budgetPercent = useMemo(() => {
    return budget > 0 ? totalSpent / budget : 0
  }, [budget, totalSpent])

  // Category breakdowns for Insights
  const categoryTotals = useMemo(() => {
    const totals = {}
    monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'expense')
      .forEach((t) => {
        const c = t.category || t.cat || 'Other'
        const val = Number(t.amount || t.amt || 0)
        totals[c] = (totals[c] || 0) + val
      })
    return totals
  }, [monthTransactions])

  const rankedCategories = useMemo(() => {
    return Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])
  }, [categoryTotals])

  const incomeCategoryTotals = useMemo(() => {
    const totals = {}
    monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .forEach((t) => {
        const c = t.category || t.cat || 'Salary'
        const val = Number(t.amount || t.amt || 0)
        totals[c] = (totals[c] || 0) + val
      })
    return totals
  }, [monthTransactions])

  const rankedIncomeCategories = useMemo(() => {
    return Object.keys(incomeCategoryTotals).sort(
      (a, b) => incomeCategoryTotals[b] - incomeCategoryTotals[a]
    )
  }, [incomeCategoryTotals])

  // Calendar info
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
        .filter(
          (t) =>
            (t.date || t.spent_on) === k && (t.type || '').toLowerCase() === 'expense'
        )
        .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)
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

  // Navigation
  const changeMonth = useCallback((delta) => {
    setMonth((curr) => {
      const nextDate = new Date(curr.year, curr.month + delta, 1)
      return {
        year: nextDate.getFullYear(),
        month: nextDate.getMonth(),
      }
    })
  }, [])

  // Sorting
  const toggleSort = useCallback((key) => {
    setSort((curr) => {
      if (curr.key === key) {
        return { key, direction: -curr.direction }
      }
      return { key, direction: -1 }
    })
  }, [])

  // Dialog Controls
  const openTransactionDialog = useCallback(
    (item = null, defaultType = 'expense') => {
      if (item) {
        setEditingId(item.id)
        setTxnType((item.type || 'expense').toLowerCase())
        setAmount(String(item.amount || item.amt || ''))
        setCategory(item.category || item.cat || (item.type === 'income' ? 'Salary' : item.type === 'transfer' ? 'Transfer' : 'Food'))
        setNote(item.note || item.title || '')
        setDate(item.date || item.spent_on || item.received_on || isoDate(new Date()))
        if (item.wallet_id) {
          setWalletId(String(item.wallet_id))
        } else if (wallets.length > 0) {
          setWalletId(String(wallets[0].id))
        }
        if (item.to_wallet_id) {
          setToWalletId(String(item.to_wallet_id))
        } else if (wallets.length > 1) {
          const other = wallets.find((w) => String(w.id) !== String(item.wallet_id))
          if (other) setToWalletId(String(other.id))
        }
      } else {
        setEditingId(null)
        setTxnType(defaultType)
        setAmount('')
        setCategory(defaultType === 'transfer' ? 'Transfer' : '')
        setNote('')
        setDate(isoDate(new Date()))
        if (wallets.length > 0) {
          setWalletId(String(wallets[0].id))
        }
        if (wallets.length > 1) {
          setToWalletId(String(wallets[1].id))
        }
      }
      setFormError('')
      setDialogOpen(true)
    },
    [wallets]
  )

  // Save Transaction (Add or Edit)
  const saveTransaction = useCallback(
    async (e) => {
      if (e && e.preventDefault) e.preventDefault()
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setFormError('Enter an amount greater than 0.')
        return
      }
      if (txnType !== 'transfer' && (!category || !category.trim())) {
        setFormError('Please select or enter a category.')
        return
      }
      if (!date) {
        setFormError('Pick a date.')
        return
      }

      // 1. Validation for Transfer
      if (txnType === 'transfer') {
        if (!walletId) {
          setFormError('Please select a source account (From).')
          return
        }
        if (!toWalletId) {
          setFormError('Please select a destination account (To).')
          return
        }
        if (String(walletId) === String(toWalletId)) {
          setFormError('Source and destination accounts must be different.')
          return
        }
        const srcWallet = wallets.find((w) => String(w.id) === String(walletId)) || wallets[0]
        if (srcWallet) {
          const avail = Number(srcWallet.current_balance ?? srcWallet.balance ?? srcWallet.initial_balance ?? 0)
          if (numericAmount > avail) {
            setFormError(
              `Insufficient funds in wallet '${srcWallet.name}'. Available balance is ₹${avail.toLocaleString(undefined, { minimumFractionDigits: 2 })}, cannot transfer ₹${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
            )
            return
          }
        }
      }

      // 2. Strict Low Balance Check for Expenses
      const targetWallet = wallets.find((w) => String(w.id) === String(walletId)) || wallets[0]
      if (txnType === 'expense' && targetWallet) {
        const avail = Number(targetWallet.current_balance ?? targetWallet.balance ?? targetWallet.initial_balance ?? 0)
        if (numericAmount > avail) {
          setFormError(
            `Insufficient funds in wallet '${targetWallet.name}'. Available balance is ₹${avail.toLocaleString(undefined, { minimumFractionDigits: 2 })}, cannot spend ₹${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
          )
          return
        }
      }

      try {
        const payload = {
          type: txnType,
          amount: numericAmount,
          amt: numericAmount,
          category: txnType === 'transfer' ? 'Transfer' : category,
          cat: txnType === 'transfer' ? 'Transfer' : category,
          note: note.trim(),
          title: note.trim(),
          date,
          wallet_id: targetWallet ? targetWallet.id : (walletId ? Number(walletId) : undefined),
          to_wallet_id: txnType === 'transfer' ? Number(toWalletId) : undefined,
        }

        if (editingId) {
          await transactionApi.updateTransaction(editingId, txnType, payload)
          showToast('Changes saved', false)
        } else {
          await transactionApi.createTransaction(payload)
          const successMsg =
            txnType === 'transfer'
              ? 'Transfer completed successfully'
              : txnType === 'income'
                ? 'Income added'
                : 'Expense added'
          showToast(successMsg, false)
        }

        const [y, m] = date.split('-').map(Number)
        setMonth({ year: y, month: m - 1 })
        setDialogOpen(false)
        await loadData()
      } catch (err) {
        setFormError(err.message || 'Error saving transaction.')
      }
    },
    [amount, txnType, category, note, date, editingId, walletId, toWalletId, wallets, loadData, showToast]
  )

  // Delete Transaction
  const deleteTransaction = useCallback(
    async (id, type) => {
      const target = transactions.find((t) => t.id === id && t.type === type)
      if (!target) return

      try {
        await transactionApi.deleteTransaction(id, type)
        lastDeletedRef.current = target
        showToast('Transaction deleted', true)
        await loadData()
      } catch (err) {
        showToast('Failed to delete transaction', false)
      }
    },
    [transactions, loadData, showToast]
  )

  // Wallet CRUD Operations
  const addWallet = useCallback(
    async (walletData) => {
      try {
        await walletApi.createWallet(walletData)
        showToast('Account created successfully')
        await loadData()
      } catch (err) {
        showToast(err.message || 'Failed to create account')
        throw err
      }
    },
    [loadData, showToast]
  )

  const updateWallet = useCallback(
    async (id, walletData) => {
      try {
        await walletApi.updateWallet(id, walletData)
        showToast('Account updated successfully')
        await loadData()
      } catch (err) {
        showToast(err.message || 'Failed to update account')
        throw err
      }
    },
    [loadData, showToast]
  )

  const deleteWallet = useCallback(
    async (id) => {
      try {
        await walletApi.deleteWallet(id)
        showToast('Account deleted successfully')
        await loadData()
      } catch (err) {
        showToast(err.message || 'Failed to delete account')
        throw err
      }
    },
    [loadData, showToast]
  )

  // Undo Delete
  const undoDelete = useCallback(async () => {
    if (!lastDeletedRef.current) return
    const toRestore = lastDeletedRef.current
    lastDeletedRef.current = null
    try {
      await transactionApi.createTransaction({
        type: toRestore.type || 'expense',
        amount: toRestore.amount || toRestore.amt,
        category: toRestore.category || toRestore.cat,
        note: toRestore.note || toRestore.title || '',
        date: toRestore.date || toRestore.spent_on || toRestore.received_on,
      })
      setToast((prev) => ({ ...prev, hidden: true }))
      await loadData()
    } catch (err) {
      console.error('Failed to restore transaction:', err)
    }
  }, [loadData])

  // CSV Import
  const handleCsvImport = useCallback(
    async (rows) => {
      try {
        const result = await transactionApi.bulkImport(rows)
        showToast(result.message || `Imported ${rows.length} transactions successfully`)
        await loadData()
      } catch (err) {
        showToast(err.message || 'Failed to import CSV transactions')
        throw err
      }
    },
    [loadData, showToast]
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
      setCategoryFilter(cat)
      window.location.hash = '#/transactions'
      showToast(`Showing ${cat} transactions`, false)
    },
    [showToast]
  )

  // Auth actions
  const handleLogin = useCallback(
    (userData) => {
      setUser(userData)
      if (userData.currency) setCurrencyState(userData.currency)
      showToast(`Welcome back, ${userData.name || userData.full_name || userData.email}!`)
      window.location.hash = '#/transactions'
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
      window.location.hash = '#/transactions'
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
    // Unified Transactions state
    transactions,
    monthTransactions,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    sort,
    toggleSort,
    loading,
    totalIncome,
    totalSpent,
    totalTransfers,
    netCashFlow,
    budget,
    budgetLeft,
    budgetPercent,
    categoryTotals,
    rankedCategories,
    incomeCategoryTotals,
    rankedIncomeCategories,
    daysLeft,
    isCurrentMonth,
    last7Days,
    activityLogs,
    // Filter Drawer & Advanced Filters
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    openFilterDrawer: () => setIsFilterDrawerOpen(true),
    closeFilterDrawer: () => setIsFilterDrawerOpen(false),
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
    activeFilterCount,
    totalFilteredCount,
    // Unified Dialog
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
    addWallet,
    updateWallet,
    deleteWallet,
    formError,
    openTransactionDialog,
    saveTransaction,
    deleteTransaction,
    undoDelete,
    // CSV Modal
    csvModalOpen,
    setCsvModalOpen,
    openCsvModal: () => setCsvModalOpen(true),
    closeCsvModal: () => setCsvModalOpen(false),
    handleCsvImport,
    // Budget & Insight Actions
    updateBudget,
    selectCategoryFilter,
    // Toast
    toast,
    showToast,
    // Backward compatibility aliases
    openExpenseDialog: () => openTransactionDialog(null, 'expense'),
    openIncomeDialog: () => openTransactionDialog(null, 'income'),
    deleteExpense: (id) => deleteTransaction(id, 'expense'),
    deleteIncome: (id) => deleteTransaction(id, 'income'),
  }
}

export default useExpenses
