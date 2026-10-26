import React, { useState, useMemo } from 'react'
import { money, CURRENCY_CONFIGS } from '../utils/formatCurrency'
import { getCategoryColor } from '../constants/categories'
import { CashFlowOverview } from '../components/CashFlowOverview'
import '../styles/pages/Dashboard.css'

// Helper for human-readable wallet type names
function getWalletTypeLabel(type) {
  const t = (type || '').toUpperCase()
  if (t === 'BANK') return 'Bank Account'
  if (t === 'WALLET' || t === 'UPI' || t === 'DIGITAL') return 'Digital Wallet'
  if (t === 'CASH') return 'Cash Wallet'
  if (t === 'CREDIT_CARD') return 'Credit Card'
  return 'Personal Account'
}

// Compact currency formatter for chart axis (e.g., ₹20K, $1.5M, €500)
function formatCompactCurrency(val, currency = 'INR') {
  const code = (currency || 'INR').toUpperCase()
  const conf = CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.INR
  const prefix = conf.symbol || '$'
  if (val === 0) return `${prefix}0`
  if (val >= 1000000) {
    return `${prefix}${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`
  }
  if (val >= 1000) {
    return `${prefix}${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`
  }
  return `${prefix}${val}`
}

// Clean SVG icon renderer replacing emojis
function renderWalletIcon(type, size = 18) {
  const t = (type || '').toUpperCase()
  if (t === 'BANK') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M3 10h18" />
        <path d="M5 6l7-3 7 3" />
        <path d="M4 10v11" />
        <path d="M20 10v11" />
        <path d="M8 14v4" />
        <path d="M12 14v4" />
        <path d="M16 14v4" />
      </svg>
    )
  }
  if (t === 'CASH') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

export function Dashboard({
  transactions = [],
  monthTransactions = [],
  totalIncome = 0,
  totalSpent = 0,
  netCashFlow = 0,
  wallets = [],
  currency = 'INR',
  month = { year: new Date().getFullYear(), month: new Date().getMonth() },
}) {
  const [period, setPeriod] = useState('7D')
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null)
  const [hoveredExpenseSlice, setHoveredExpenseSlice] = useState(null)
  const [expenseTooltipPos, setExpenseTooltipPos] = useState(null)
  const [hoveredIncomeSlice, setHoveredIncomeSlice] = useState(null)
  const [incomeTooltipPos, setIncomeTooltipPos] = useState(null)

  const handleSliceHover = (item, e, setSlice, setPos) => {
    setSlice(item)
    if (e && e.currentTarget) {
      const wrapper = e.currentTarget.closest('.dashboard-donut-graphic-wrapper')
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect()
        setPos({
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top),
        })
      }
    }
  }

  const handleSliceMove = (item, e, setPos) => {
    if (e && e.currentTarget) {
      const wrapper = e.currentTarget.closest('.dashboard-donut-graphic-wrapper')
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect()
        setPos({
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top),
        })
      }
    }
  }

  const handleSliceLeave = (setSlice, setPos) => {
    setSlice(null)
    setPos(null)
  }

  // 1. Total Balance across all wallets
  const totalBalance = useMemo(() => {
    return wallets.reduce(
      (sum, w) => sum + Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0),
      0
    )
  }, [wallets])


  // 3. Process Income vs Expenses Dual Bar Chart Data based on selected period
  const chartData = useMemo(() => {
    if (period === '3M' || period === '6M' || period === '1Y') {
      const monthCount = period === '3M' ? 3 : period === '6M' ? 6 : 12
      const months = []
      const curr = new Date(month.year, month.month, 1)

      for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1)
        const y = d.getFullYear()
        const m = d.getMonth()
        const label = d.toLocaleDateString('en-US', { month: 'short' })

        const inc = transactions
          .filter((t) => {
            const raw = t.date || t.spent_on || t.received_on
            if (!raw) return false
            const [ty, tm] = raw.split('-').map(Number)
            return ty === y && tm === m + 1 && (t.type || '').toLowerCase() === 'income'
          })
          .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)

        const exp = transactions
          .filter((t) => {
            const raw = t.date || t.spent_on || t.received_on
            if (!raw) return false
            const [ty, tm] = raw.split('-').map(Number)
            return ty === y && tm === m + 1 && (t.type || '').toLowerCase() === 'expense'
          })
          .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)

        months.push({ label, displayDate: `${label} ${y}`, income: inc, expense: exp })
      }
      return months
    }

    // Default: '7D' (Last 7 days)
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

      const inc = transactions
        .filter((t) => (t.date || t.spent_on || t.received_on) === dateStr && (t.type || '').toLowerCase() === 'income')
        .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)

      const exp = transactions
        .filter((t) => (t.date || t.spent_on || t.received_on) === dateStr && (t.type || '').toLowerCase() === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || t.amt || 0), 0)

      days.push({ label, displayDate, income: inc, expense: exp })
    }
    return days
  }, [period, transactions, month])

  // Max value in chart data to scale bar heights
  const maxChartVal = useMemo(() => {
    let max = 0
    chartData.forEach((d) => {
      if (d.income > max) max = d.income
      if (d.expense > max) max = d.expense
    })
    return Math.max(max, 1000)
  }, [chartData])

  // 4. Expense Breakdown Donut Data
  const expenseBreakdown = useMemo(() => {
    const totals = {}
    monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'expense')
      .forEach((t) => {
        const cat = t.category || t.cat || 'Other'
        const val = Number(t.amount || t.amt || 0)
        totals[cat] = (totals[cat] || 0) + val
      })

    const sorted = Object.keys(totals)
      .map((cat) => ({
        name: cat,
        amount: totals[cat],
        color: getCategoryColor(cat),
      }))
      .sort((a, b) => b.amount - a.amount)

    if (sorted.length === 0) return []

    // Take top 4 categories, sum remaining into 'Others'
    const top = sorted.slice(0, 4)
    const remaining = sorted.slice(4)

    if (remaining.length > 0) {
      const remainingSum = remaining.reduce((s, c) => s + c.amount, 0)
      top.push({
        name: 'Others',
        amount: remainingSum,
        color: '#64748b',
      })
    }

    return top.map((item) => ({
      ...item,
      percentage: totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0,
    }))
  }, [monthTransactions, totalSpent])

  // 5. Income Sources Donut Data
  const incomeBreakdown = useMemo(() => {
    const totals = {}
    monthTransactions
      .filter((t) => (t.type || '').toLowerCase() === 'income')
      .forEach((t) => {
        const cat = t.category || t.cat || 'Salary'
        const val = Number(t.amount || t.amt || 0)
        totals[cat] = (totals[cat] || 0) + val
      })

    const sorted = Object.keys(totals)
      .map((cat) => ({
        name: cat,
        amount: totals[cat],
        color: getCategoryColor(cat),
      }))
      .sort((a, b) => b.amount - a.amount)

    if (sorted.length === 0) return []

    const top = sorted.slice(0, 4)
    const remaining = sorted.slice(4)

    if (remaining.length > 0) {
      const remainingSum = remaining.reduce((s, c) => s + c.amount, 0)
      top.push({
        name: 'Other',
        amount: remainingSum,
        color: '#64748b',
      })
    }

    return top.map((item) => ({
      ...item,
      percentage: totalIncome > 0 ? Math.round((item.amount / totalIncome) * 100) : 0,
    }))
  }, [monthTransactions, totalIncome])

  // 6. Recent Transactions: Read-Only (Sort newest first, take 5-7 items)
  const recentTransactions = useMemo(() => {
    const source = monthTransactions.length > 0 ? monthTransactions : transactions
    return [...source]
      .sort((a, b) => {
        const dateA = a.date || a.spent_on || a.received_on || ''
        const dateB = b.date || b.spent_on || b.received_on || ''
        return dateB.localeCompare(dateA) || (b.id || 0) - (a.id || 0)
      })
      .slice(0, 6)
  }, [monthTransactions, transactions])

  // Helper to render SVG Donut Rings
  const renderDonutCircles = (items, total, hoveredSlice, onHover, onMove, onLeave, prefix = '') => {
    const r = 52
    const circumference = 2 * Math.PI * r
    let accumulatedPct = 0

    if (!items || items.length === 0 || total === 0) {
      return (
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--pl-border-subtle)"
          strokeWidth="16"
          opacity="0.5"
        />
      )
    }

    const track = (
      <circle
        key="bg-track"
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--pl-border-subtle)"
        strokeWidth="16"
        opacity="0.35"
      />
    )

    const slices = items.map((item, idx) => {
      const pct = (item.amount / total) * 100
      const gap = items.length > 1 ? 2.5 : 0
      const strokeLength = Math.max((pct / 100) * circumference - gap, 3)
      const strokeDasharray = `${strokeLength} ${circumference}`
      const strokeDashoffset = -((accumulatedPct / 100) * circumference)
      accumulatedPct += pct

      const isHovered = hoveredSlice && hoveredSlice.name === item.name
      const isDimmed = hoveredSlice && hoveredSlice.name !== item.name

      return (
        <circle
          key={item.name || idx}
          className={`dashboard-donut-segment ${isHovered ? 'hovered' : ''}`}
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={item.color}
          strokeWidth={isHovered ? 21 : 16}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap={items.length === 1 ? 'round' : 'butt'}
          onMouseEnter={(e) => onHover && onHover(item, e)}
          onMouseMove={(e) => onMove && onMove(item, e)}
          onMouseLeave={() => onLeave && onLeave()}
          style={{
            cursor: 'pointer',
            opacity: isDimmed ? 0.35 : 1,
            filter: isHovered ? `drop-shadow(0 0 6px ${item.color}99)` : 'none',
            transition: 'stroke-width 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, filter 0.2s ease',
          }}
        >
          <title>{`${item.name}: ${prefix}${money(item.amount, currency)} (${item.percentage}%)`}</title>
        </circle>
      )
    })

    return [track, ...slices]
  }

  return (
    <div className="dashboard-view" id="dashboard-page">
      {/* ---------------------------------------------------------------------
          Row 1: Four Top Summary Cards
          --------------------------------------------------------------------- */}
      <div className="dashboard-kpis">
        {/* Card 1: Total Income (Green) */}
        <div className="dashboard-kpi-card income">
          <div className="dashboard-kpi-top">
            <span className="dashboard-kpi-label">TOTAL INCOME</span>
            <div className="dashboard-kpi-badge income" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <b className="dashboard-kpi-amount pos">+{money(totalIncome, currency)}</b>
          <div className="dashboard-kpi-sub">
            <span className="dashboard-kpi-pill income">Income</span>
            <span>Recorded this month</span>
          </div>
        </div>

        {/* Card 2: Total Expenses (Red) */}
        <div className="dashboard-kpi-card expense">
          <div className="dashboard-kpi-top">
            <span className="dashboard-kpi-label">TOTAL EXPENSES</span>
            <div className="dashboard-kpi-badge expense" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
          </div>
          <b className="dashboard-kpi-amount neg">-{money(totalSpent, currency)}</b>
          <div className="dashboard-kpi-sub">
            <span className="dashboard-kpi-pill expense">Expenses</span>
            <span>Recorded this month</span>
          </div>
        </div>

        {/* Card 3: Total Balance (Blue) */}
        <div className="dashboard-kpi-card balance">
          <div className="dashboard-kpi-top">
            <span className="dashboard-kpi-label">TOTAL BALANCE</span>
            <div className="dashboard-kpi-badge balance" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
          <b className="dashboard-kpi-amount balance">{money(totalBalance, currency)}</b>
          <div className="dashboard-kpi-sub">
            <span className="dashboard-kpi-pill balance">Active</span>
            <span>Across {wallets.length || 0} wallet{wallets.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Card 4: Net Cash Flow (Purple) */}
        <div className="dashboard-kpi-card flow">
          <div className="dashboard-kpi-top">
            <span className="dashboard-kpi-label">NET CASH FLOW</span>
            <div className={`dashboard-kpi-badge ${netCashFlow >= 0 ? 'flow-pos' : 'flow-neg'}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
          <b className={`dashboard-kpi-amount ${netCashFlow >= 0 ? 'pos' : 'neg'}`}>
            {netCashFlow >= 0 ? '+' : '-'}
            {money(Math.abs(netCashFlow), currency)}
          </b>
          <div className="dashboard-kpi-sub">
            <span className={`dashboard-kpi-pill ${netCashFlow >= 0 ? 'flow-pos' : 'flow-neg'}`}>
              {netCashFlow >= 0 ? 'Positive' : 'Deficit'}
            </span>
            <span>Net cash difference</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Row 2: Your Wallets Section (Expands Full Width, No 2nd-Row Total Balance Card)
          --------------------------------------------------------------------- */}
      <section className="dashboard-section-card" aria-label="Your Wallets Overview">
        <div className="dashboard-card-header">
          <div className="dashboard-header-title-group">
            <div className="dashboard-header-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 12h.01" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <h2 className="dashboard-card-title">Your Wallets</h2>
              <p className="dashboard-card-subtitle">Manage your wallets and accounts</p>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <a href="#/wallets" className="dashboard-link">
              View All Wallets →
            </a>
          </div>
        </div>

        {/* Wallets Grid */}
        <div className="dashboard-wallets-grid">
          {wallets && wallets.length > 0 ? (
            wallets.map((w, idx) => {
              const bal = Number(w.current_balance ?? w.balance ?? w.initial_balance ?? 0)
              const typeLabel = getWalletTypeLabel(w.wallet_type)
              const accentColor = w.color || (idx === 0 ? '#10b981' : idx === 1 ? '#2563eb' : '#8b5cf6')
              const isPrimary = idx === 0 || w.is_default

              return (
                <div
                  key={w.id}
                  className="dashboard-wallet-tile"
                  style={{ '--wallet-accent': accentColor }}
                >
                  <div
                    className="dashboard-wallet-ambient"
                    style={{
                      background: `radial-gradient(circle at 15% 20%, ${accentColor}18 0%, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="dashboard-wallet-top">
                    <div className="dashboard-wallet-main">
                      <div
                        className="dashboard-wallet-icon"
                        style={{ backgroundColor: accentColor }}
                        aria-hidden="true"
                      >
                        {renderWalletIcon(w.wallet_type, 18)}
                      </div>
                      <div className="dashboard-wallet-meta">
                        <span className="dashboard-wallet-name" title={w.name}>
                          {w.name}
                        </span>
                        <span className="dashboard-wallet-type">{typeLabel}</span>
                      </div>
                    </div>
                    <span className="dashboard-wallet-chevron" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>

                  <div className="dashboard-wallet-bottom">
                    <span className="dashboard-wallet-balance">{money(bal, currency)}</span>
                    {isPrimary && (
                      <span className="dashboard-wallet-primary-tag">
                        <span className="dashboard-primary-dot" />
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="dashboard-empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="dashboard-empty-title">No wallets found</div>
              <div className="dashboard-empty-sub">
                Connect your bank, cash, or digital wallets to track balances accurately.
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Full-Width Cash Flow Overview Chart (Income vs Expenses — Last 6 Months)
          --------------------------------------------------------------------- */}
      <CashFlowOverview
        transactions={transactions}
        currency={currency}
        month={month}
      />

      {/* ---------------------------------------------------------------------
          Row 3: Analytics Row (Income vs Expenses Bar + Expense Donut + Income Donut)
          --------------------------------------------------------------------- */}
      <div className="dashboard-charts-row">
        {/* Chart A: Income vs Expenses Dual-Bar Chart */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <div>
              <h2 className="dashboard-card-title">Income vs Expenses</h2>
              <p className="dashboard-card-subtitle">Track your monthly financial flow</p>
            </div>

            <div className="dashboard-period-pills" role="radiogroup" aria-label="Select period">
              {['7D', '3M', '6M', '1Y'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`dashboard-period-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                  aria-pressed={period === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-chart-legend">
            <span>
              <span className="dashboard-legend-dot income"></span>
              Income
            </span>
            <span>
              <span className="dashboard-legend-dot expense"></span>
              Expenses
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="dashboard-bar-chart-container">
            {/* Y-Axis */}
            <div className="dashboard-chart-y-axis">
              <span>{formatCompactCurrency(maxChartVal, currency)}</span>
              <span>{formatCompactCurrency(Math.round(maxChartVal * 0.66), currency)}</span>
              <span>{formatCompactCurrency(Math.round(maxChartVal * 0.33), currency)}</span>
              <span>{formatCompactCurrency(0, currency)}</span>
            </div>

            {/* Plot Area */}
            <div className="dashboard-chart-plot">
              <div className="dashboard-grid-lines">
                <div className="dashboard-grid-line"></div>
                <div className="dashboard-grid-line"></div>
                <div className="dashboard-grid-line"></div>
                <div className="dashboard-grid-line"></div>
              </div>

              <div className="dashboard-bars-wrapper" onClick={(e) => { if (e.target === e.currentTarget) setHoveredBarIndex(null) }}>
                {chartData.map((d, idx) => {
                  const incHeight = Math.max((d.income / maxChartVal) * 140, 3)
                  const expHeight = Math.max((d.expense / maxChartVal) * 140, 3)
                  const isHovered = hoveredBarIndex === idx
                  const alignClass = idx === 0 ? 'align-left' : idx === chartData.length - 1 ? 'align-right' : ''

                  return (
                    <div
                      key={idx}
                      className={`dashboard-bar-group ${isHovered ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setHoveredBarIndex((prev) => (prev === idx ? null : idx))
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        setHoveredBarIndex((prev) => (prev === idx ? null : idx))
                      }}
                      role="button"
                      tabIndex={0}
                      title={`${d.displayDate || d.label}: +${money(d.income, currency)} / -${money(d.expense, currency)}`}
                    >
                      {/* Income Bar */}
                      <div
                        className="dashboard-bar income"
                        style={{ height: `${incHeight}px` }}
                      ></div>
                      {/* Expense Bar */}
                      <div
                        className="dashboard-bar expense"
                        style={{ height: `${expHeight}px` }}
                      ></div>

                      {/* Tooltip on Touch / Hover */}
                      {isHovered && (
                        <div className={`dashboard-chart-tooltip ${alignClass}`}>
                          <div className="dashboard-chart-tooltip-header">
                            <span>{d.displayDate || d.label}</span>
                          </div>
                          <div className="dashboard-chart-tooltip-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="dashboard-tooltip-dot income" />
                              <span>Income</span>
                            </div>
                            <span className="dashboard-chart-tooltip-val income">
                              +{money(d.income, currency)}
                            </span>
                          </div>
                          <div className="dashboard-chart-tooltip-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="dashboard-tooltip-dot expense" />
                              <span>Expenses</span>
                            </div>
                            <span className="dashboard-chart-tooltip-val expense">
                              -{money(d.expense, currency)}
                            </span>
                          </div>
                          <div className="dashboard-chart-tooltip-divider" />
                          <div className="dashboard-chart-tooltip-row net">
                            <span>Net</span>
                            <span className={`dashboard-chart-tooltip-val ${d.income >= d.expense ? 'income' : 'expense'}`}>
                              {d.income >= d.expense ? '+' : '-'}
                              {money(Math.abs(d.income - d.expense), currency)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="dashboard-chart-x-axis">
                {chartData.map((d, idx) =>
                  d.label ? (
                    <span key={idx} style={{ flex: 1, textAlign: 'center' }}>
                      {d.label}
                    </span>
                  ) : (
                    <span key={idx} style={{ flex: 1 }}></span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart B: Expense Breakdown Donut */}
        <div className="dashboard-chart-card">
          <div>
            <h2 className="dashboard-card-title">Expense Breakdown</h2>
            <p className="dashboard-card-subtitle">Where your money goes</p>
          </div>

          <div className="dashboard-donut-content">
            <div className="dashboard-donut-graphic-wrapper">
              <svg className="dashboard-donut-svg" viewBox="0 0 140 140">
                {renderDonutCircles(
                  expenseBreakdown,
                  totalSpent,
                  hoveredExpenseSlice,
                  (item, e) => handleSliceHover(item, e, setHoveredExpenseSlice, setExpenseTooltipPos),
                  (item, e) => handleSliceMove(item, e, setExpenseTooltipPos),
                  () => handleSliceLeave(setHoveredExpenseSlice, setExpenseTooltipPos),
                  '-'
                )}
              </svg>

              <div className="dashboard-donut-center">
                <span
                  className="dashboard-donut-center-amount"
                  style={{
                    color: hoveredExpenseSlice ? hoveredExpenseSlice.color : 'var(--pl-text-primary)',
                    transition: 'color 0.2s ease',
                  }}
                  title={money(hoveredExpenseSlice ? hoveredExpenseSlice.amount : totalSpent, currency)}
                >
                  {money(hoveredExpenseSlice ? hoveredExpenseSlice.amount : totalSpent, currency)}
                </span>
                <span className="dashboard-donut-center-label">
                  {hoveredExpenseSlice
                    ? `${hoveredExpenseSlice.name} (${hoveredExpenseSlice.percentage}%)`
                    : 'Total Expenses'}
                </span>
              </div>

              {/* Floating Tooltip */}
              {hoveredExpenseSlice && (
                <div
                  className={`dashboard-donut-tooltip ${expenseTooltipPos && expenseTooltipPos.y <= 55 ? 'placed-below' : 'placed-above'}`}
                  role="tooltip"
                  style={
                    expenseTooltipPos
                      ? {
                          left: `${expenseTooltipPos.x}px`,
                          top: `${expenseTooltipPos.y <= 55 ? expenseTooltipPos.y + 18 : expenseTooltipPos.y - 12}px`,
                          transform: expenseTooltipPos.y <= 55 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                        }
                      : {
                          left: '50%',
                          bottom: 'calc(100% + 10px)',
                          transform: 'translateX(-50%)',
                        }
                  }
                >
                  <div className="dashboard-donut-tooltip-header">
                    <span
                      className="dashboard-donut-tooltip-dot"
                      style={{ backgroundColor: hoveredExpenseSlice.color }}
                    />
                    <span className="dashboard-donut-tooltip-title">{hoveredExpenseSlice.name}</span>
                    <span className="dashboard-donut-tooltip-pct">{hoveredExpenseSlice.percentage}%</span>
                  </div>
                  <div className="dashboard-donut-tooltip-amount">
                    -{money(hoveredExpenseSlice.amount, currency)}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="dashboard-donut-legend">
              {expenseBreakdown.length > 0 ? (
                expenseBreakdown.map((item, idx) => {
                  const isHovered = hoveredExpenseSlice && hoveredExpenseSlice.name === item.name
                  const isDimmed = hoveredExpenseSlice && hoveredExpenseSlice.name !== item.name
                  return (
                    <div
                      key={idx}
                      className={`dashboard-donut-legend-item ${isHovered ? 'is-hovered' : ''}`}
                      onMouseEnter={() => setHoveredExpenseSlice(item)}
                      onMouseLeave={() => {
                        setHoveredExpenseSlice(null)
                        setExpenseTooltipPos(null)
                      }}
                      style={{
                        opacity: isDimmed ? 0.35 : 1,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease, background 0.15s ease, transform 0.15s ease',
                      }}
                    >
                      <div className="dashboard-donut-legend-left">
                        <span
                          className="dashboard-donut-legend-dot"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="dashboard-donut-legend-name" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="dashboard-donut-legend-right">
                        <span className="dashboard-donut-legend-pct">{item.percentage}%</span>
                        <span className="dashboard-donut-legend-amt">
                          {money(item.amount, currency)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="dashboard-empty-sub" style={{ textAlign: 'center', padding: '10px 0' }}>
                  No expenses recorded this month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart C: Income Sources Donut */}
        <div className="dashboard-chart-card">
          <div>
            <h2 className="dashboard-card-title">Income Sources</h2>
            <p className="dashboard-card-subtitle">Where your money comes from</p>
          </div>

          <div className="dashboard-donut-content">
            <div className="dashboard-donut-graphic-wrapper">
              <svg className="dashboard-donut-svg" viewBox="0 0 140 140">
                {renderDonutCircles(
                  incomeBreakdown,
                  totalIncome,
                  hoveredIncomeSlice,
                  (item, e) => handleSliceHover(item, e, setHoveredIncomeSlice, setIncomeTooltipPos),
                  (item, e) => handleSliceMove(item, e, setIncomeTooltipPos),
                  () => handleSliceLeave(setHoveredIncomeSlice, setIncomeTooltipPos),
                  '+'
                )}
              </svg>

              <div className="dashboard-donut-center">
                <span
                  className="dashboard-donut-center-amount"
                  style={{
                    color: hoveredIncomeSlice ? hoveredIncomeSlice.color : 'var(--pl-text-primary)',
                    transition: 'color 0.2s ease',
                  }}
                  title={money(hoveredIncomeSlice ? hoveredIncomeSlice.amount : totalIncome, currency)}
                >
                  {money(hoveredIncomeSlice ? hoveredIncomeSlice.amount : totalIncome, currency)}
                </span>
                <span className="dashboard-donut-center-label">
                  {hoveredIncomeSlice
                    ? `${hoveredIncomeSlice.name} (${hoveredIncomeSlice.percentage}%)`
                    : 'Total Income'}
                </span>
              </div>

              {/* Floating Tooltip */}
              {hoveredIncomeSlice && (
                <div
                  className={`dashboard-donut-tooltip ${incomeTooltipPos && incomeTooltipPos.y <= 55 ? 'placed-below' : 'placed-above'}`}
                  role="tooltip"
                  style={
                    incomeTooltipPos
                      ? {
                          left: `${incomeTooltipPos.x}px`,
                          top: `${incomeTooltipPos.y <= 55 ? incomeTooltipPos.y + 18 : incomeTooltipPos.y - 12}px`,
                          transform: incomeTooltipPos.y <= 55 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                        }
                      : {
                          left: '50%',
                          bottom: 'calc(100% + 10px)',
                          transform: 'translateX(-50%)',
                        }
                  }
                >
                  <div className="dashboard-donut-tooltip-header">
                    <span
                      className="dashboard-donut-tooltip-dot"
                      style={{ backgroundColor: hoveredIncomeSlice.color }}
                    />
                    <span className="dashboard-donut-tooltip-title">{hoveredIncomeSlice.name}</span>
                    <span className="dashboard-donut-tooltip-pct">{hoveredIncomeSlice.percentage}%</span>
                  </div>
                  <div className="dashboard-donut-tooltip-amount">
                    +{money(hoveredIncomeSlice.amount, currency)}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="dashboard-donut-legend">
              {incomeBreakdown.length > 0 ? (
                incomeBreakdown.map((item, idx) => {
                  const isHovered = hoveredIncomeSlice && hoveredIncomeSlice.name === item.name
                  const isDimmed = hoveredIncomeSlice && hoveredIncomeSlice.name !== item.name
                  return (
                    <div
                      key={idx}
                      className={`dashboard-donut-legend-item ${isHovered ? 'is-hovered' : ''}`}
                      onMouseEnter={() => setHoveredIncomeSlice(item)}
                      onMouseLeave={() => {
                        setHoveredIncomeSlice(null)
                        setIncomeTooltipPos(null)
                      }}
                      style={{
                        opacity: isDimmed ? 0.35 : 1,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease, background 0.15s ease, transform 0.15s ease',
                      }}
                    >
                      <div className="dashboard-donut-legend-left">
                        <span
                          className="dashboard-donut-legend-dot"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="dashboard-donut-legend-name" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="dashboard-donut-legend-right">
                        <span className="dashboard-donut-legend-pct">{item.percentage}%</span>
                        <span className="dashboard-donut-legend-amt">
                          {money(item.amount, currency)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="dashboard-empty-sub" style={{ textAlign: 'center', padding: '10px 0' }}>
                  No income recorded this month
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          Row 4: Recent Transactions (Read-Only Table - NO Actions Column)
          --------------------------------------------------------------------- */}
      <section className="dashboard-section-card" aria-label="Recent Transactions">
        <div className="dashboard-card-header">
          <div>
            <h2 className="dashboard-card-title">Recent Transactions</h2>
            <p className="dashboard-card-subtitle">Your latest financial activities</p>
          </div>

          <a href="#/transactions" className="dashboard-link">
            <span>View All Transactions</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        <div className="dashboard-recent-table-wrapper">
          {recentTransactions.length > 0 ? (
            <table className="dashboard-recent-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Wallet</th>
                  <th className="amount-th">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const rawDate = tx.date || tx.spent_on || tx.received_on
                  const dateObj = rawDate
                    ? new Date(rawDate.includes('T') ? rawDate : `${rawDate}T00:00`)
                    : new Date()
                  const dateStr = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })

                  const tType = (tx.type || 'expense').toLowerCase()
                  const isIncome = tType === 'income'
                  const isTransfer = tType === 'transfer'
                  const cat = tx.category || tx.cat || (isIncome ? 'Salary' : isTransfer ? 'Transfer' : 'Other')
                  const catColor = getCategoryColor(cat)
                  const desc = tx.note || tx.title || cat
                  const amountVal = Number(tx.amount || tx.amt || 0)
                  const walletName = tx.wallet_name || 'Main Wallet'

                  return (
                    <tr key={`${tx.type}-${tx.id}`}>
                      {/* Date with icon */}
                      <td>
                        <div className="dashboard-txn-date-cell">
                          <span className={`dashboard-txn-type-icon ${tType}`} aria-hidden="true">
                            {isIncome ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                              </svg>
                            ) : isTransfer ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 3l4 4-4 4" />
                                <path d="M20 7H4" />
                                <path d="M8 21l-4-4 4-4" />
                                <path d="M4 17h16" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="7" x2="17" y2="17" />
                                <polyline points="17 7 17 17 7 17" />
                              </svg>
                            )}
                          </span>
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td>
                        <span className="dashboard-txn-desc" title={desc}>
                          {desc}
                        </span>
                      </td>

                      {/* Category Pill */}
                      <td>
                        <span
                          className="dashboard-badge"
                          style={{
                            backgroundColor: `${catColor}14`,
                            color: catColor,
                            borderColor: `${catColor}30`,
                          }}
                        >
                          <span className="dashboard-badge-dot" style={{ backgroundColor: catColor }} />
                          {cat}
                        </span>
                      </td>

                      {/* Type Pill */}
                      <td>
                        <span className={`dashboard-type-pill ${tType}`}>
                          <span className="dashboard-type-pill-dot" />
                          {isIncome ? 'Income' : isTransfer ? 'Transfer' : 'Expense'}
                        </span>
                      </td>

                      {/* Wallet */}
                      <td>
                        <span className="dashboard-txn-wallet">
                          <span className="dashboard-txn-wallet-icon" aria-hidden="true">
                            {renderWalletIcon(tx.wallet_type, 13)}
                          </span>
                          <span>{walletName}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="amount-th">
                        <span className={`dashboard-txn-amount ${tType}`}>
                          {isIncome ? `+${money(amountVal, currency)}` : isTransfer ? money(amountVal, currency) : `-${money(amountVal, currency)}`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-title">No recent transactions</div>
              <div className="dashboard-empty-sub">
                Income and expenses you record will appear here in chronological order.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
