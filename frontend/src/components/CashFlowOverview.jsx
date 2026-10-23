import React, { useState, useMemo } from 'react'
import { money } from '../utils/formatCurrency'
import '../styles/components/CashFlowOverview.css'

/**
 * Currency compact formatter for chart Y-axis (e.g., ₹0, ₹25k, ₹1.5L / $25k, $1.5M)
 */
function formatCompactCurrency(val, currency = 'INR') {
  if (val === 0) return '0'
  const isINR = (currency || '').toUpperCase() === 'INR'
  const prefix = isINR ? '₹' : (currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$')

  if (isINR) {
    if (val >= 10000000) {
      const v = (val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1)
      return `${prefix}${v}Cr`
    }
    if (val >= 100000) {
      const v = (val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)
      return `${prefix}${v}L`
    }
  } else {
    if (val >= 1000000) {
      const v = (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)
      return `${prefix}${v}M`
    }
  }

  if (val >= 1000) {
    const v = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)
    return `${prefix}${v}k`
  }

  return `${prefix}${val}`
}

/**
 * Calculates a clean, aesthetically pleasing upper bound for the Y-axis.
 */
function calculateNiceMax(val) {
  if (!val || val <= 0) return 1000
  const target = val * 1.15
  const magnitude = Math.pow(10, Math.floor(Math.log10(target)))
  const norm = target / magnitude

  let step
  if (norm <= 1) step = 1
  else if (norm <= 1.5) step = 1.5
  else if (norm <= 2) step = 2
  else if (norm <= 2.5) step = 2.5
  else if (norm <= 3) step = 3
  else if (norm <= 4) step = 4
  else if (norm <= 5) step = 5
  else if (norm <= 6) step = 6
  else if (norm <= 8) step = 8
  else step = 10

  return Math.max(step * magnitude, 1000)
}

/**
 * Converts a set of 2D points into a smooth cubic Catmull-Rom Bezier SVG path.
 */
function generateSplinePath(points, baselineY) {
  if (!points || points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`

  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    // Catmull-Rom cubic Bezier control points
    let cp1x = p1.x + (p2.x - p0.x) / 6
    let cp1y = p1.y + (p2.y - p0.y) / 6

    let cp2x = p2.x - (p3.x - p1.x) / 6
    let cp2y = p2.y - (p3.y - p1.y) / 6

    // Guard against dips below baseline or above top
    if (baselineY !== undefined) {
      cp1y = Math.min(baselineY, cp1y)
      cp2y = Math.min(baselineY, cp2y)
    }

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }

  return path
}

/**
 * Creates the closed polygon path for SVG gradient area fills.
 */
function generateAreaPath(linePath, points, baselineY) {
  if (!linePath || !points || points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath} L ${last.x.toFixed(1)},${baselineY.toFixed(1)} L ${first.x.toFixed(1)},${baselineY.toFixed(1)} Z`
}

/**
 * SVG Geometry & Coordinate Configuration (Module Constants)
 */
const SVG_WIDTH = 800
const SVG_HEIGHT = 270
const PADDING = {
  top: 28,
  right: 28,
  bottom: 38,
  left: 64,
}

const PLOT_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom
const BASELINE_Y = PADDING.top + PLOT_HEIGHT

export function CashFlowOverview({
  transactions = [],
  currency = 'INR',
  month = null,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // 1. Compute the last 6 months in chronological order with income and expenses
  const monthsData = useMemo(() => {
    const now = new Date()
    const anchor = (month && typeof month.year === 'number' && typeof month.month === 'number')
      ? new Date(month.year, month.month, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1)

    const list = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth() // 0-indexed (0=Jan ... 11=Dec)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const fullMonthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      const key = `${y}-${String(m + 1).padStart(2, '0')}`

      let income = 0
      let expense = 0

      if (Array.isArray(transactions)) {
        transactions.forEach((tx) => {
          const raw = tx.date || tx.spent_on || tx.received_on
          if (!raw) return
          const str = String(raw).trim()

          let txYear = null
          let txMonth = null // 1-indexed

          // Handle YYYY-MM-DD
          const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})/)
          if (ymdMatch) {
            txYear = parseInt(ymdMatch[1], 10)
            txMonth = parseInt(ymdMatch[2], 10)
          } else {
            // Handle DD-MM-YYYY or DD/MM/YYYY
            const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
            if (dmyMatch) {
              txYear = parseInt(dmyMatch[3], 10)
              txMonth = parseInt(dmyMatch[2], 10)
            } else {
              const parsed = new Date(str)
              if (!isNaN(parsed.getTime())) {
                txYear = parsed.getFullYear()
                txMonth = parsed.getMonth() + 1
              }
            }
          }

          if (txYear === y && txMonth === m + 1) {
            const type = (tx.type || '').toLowerCase()
            const amt = Number(tx.amount || tx.amt || 0)
            if (!isNaN(amt) && amt > 0) {
              if (type === 'income') {
                income += amt
              } else if (type === 'expense') {
                expense += amt
              }
            }
          }
        })
      }

      list.push({
        key,
        label,
        fullMonthName,
        year: y,
        monthIndex: m,
        income,
        expense,
        net: income - expense,
      })
    }

    return list
  }, [transactions, month])

  // 2. Scale calculation
  const { yMax, gridTicks } = useMemo(() => {
    let peak = 0
    monthsData.forEach((d) => {
      if (d.income > peak) peak = d.income
      if (d.expense > peak) peak = d.expense
    })

    const computedMax = calculateNiceMax(peak)

    // 4 horizontal ticks: 100%, 66.6%, 33.3%, 0%
    const ticks = [
      { ratio: 1.0, y: PADDING.top, val: computedMax },
      { ratio: 0.666, y: PADDING.top + PLOT_HEIGHT * 0.334, val: Math.round(computedMax * 0.666) },
      { ratio: 0.333, y: PADDING.top + PLOT_HEIGHT * 0.667, val: Math.round(computedMax * 0.333) },
      { ratio: 0.0, y: BASELINE_Y, val: 0 },
    ]

    return { yMax: computedMax, gridTicks: ticks }
  }, [monthsData])

  // 3. Coordinates of Income & Expense points
  const { incomePoints, expensePoints } = useMemo(() => {
    const incPts = []
    const expPts = []
    const count = monthsData.length

    monthsData.forEach((d, idx) => {
      const x = PADDING.left + (idx / Math.max(count - 1, 1)) * PLOT_WIDTH
      const yInc = BASELINE_Y - (d.income / yMax) * PLOT_HEIGHT
      const yExp = BASELINE_Y - (d.expense / yMax) * PLOT_HEIGHT

      incPts.push({ x, y: yInc, data: d, index: idx })
      expPts.push({ x, y: yExp, data: d, index: idx })
    })

    return { incomePoints: incPts, expensePoints: expPts }
  }, [monthsData, yMax])

  // 4. Spline line & area paths
  const incomeLinePath = useMemo(() => generateSplinePath(incomePoints, BASELINE_Y), [incomePoints])
  const expenseLinePath = useMemo(() => generateSplinePath(expensePoints, BASELINE_Y), [expensePoints])
  const incomeAreaPath = useMemo(() => generateAreaPath(incomeLinePath, incomePoints, BASELINE_Y), [incomeLinePath, incomePoints])
  const expenseAreaPath = useMemo(() => generateAreaPath(expenseLinePath, expensePoints, BASELINE_Y), [expenseLinePath, expensePoints])

  // Check if all months have 0 values
  const hasAnyData = useMemo(() => {
    return monthsData.some((m) => m.income > 0 || m.expense > 0)
  }, [monthsData])

  // Active hovered month data
  const activeMonth = hoveredIndex !== null ? monthsData[hoveredIndex] : null
  const activeIncPoint = hoveredIndex !== null ? incomePoints[hoveredIndex] : null
  const activeExpPoint = hoveredIndex !== null ? expensePoints[hoveredIndex] : null

  // Tooltip positioning percentages
  const tooltipStyle = useMemo(() => {
    if (hoveredIndex === null || !activeIncPoint || !activeExpPoint) return null
    const xPct = (activeIncPoint.x / SVG_WIDTH) * 100
    const minY = Math.min(activeIncPoint.y, activeExpPoint.y)
    const yPct = (minY / SVG_HEIGHT) * 100

    let transform = 'translate(-50%, -105%)'
    if (hoveredIndex === 0) {
      transform = 'translate(-10%, -105%)'
    } else if (hoveredIndex === monthsData.length - 1) {
      transform = 'translate(-90%, -105%)'
    }

    return {
      left: `${xPct}%`,
      top: `${yPct}%`,
      transform,
    }
  }, [hoveredIndex, activeIncPoint, activeExpPoint, monthsData.length])

  const colWidth = PLOT_WIDTH / Math.max(monthsData.length - 1, 1)

  return (
    <section className="dashboard-section-card cashflow-section" aria-label="Cash Flow Overview">
      {/* -----------------------------------------------------------------
          Card Header: Title + Subtitle on Left, Legend on Right
          ----------------------------------------------------------------- */}
      <div className="cashflow-header">
        <div className="cashflow-title-group">
          <h2 className="cashflow-title">Cash Flow Overview</h2>
          <p className="cashflow-subtitle">Income vs Expenses — last 6 months</p>
        </div>

        <div className="cashflow-legend" role="group" aria-label="Chart legend">
          <div className="cashflow-legend-item">
            <span className="cashflow-legend-dot income" aria-hidden="true" />
            <span>Income</span>
          </div>
          <div className="cashflow-legend-item">
            <span className="cashflow-legend-dot expense" aria-hidden="true" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          Chart Body: Responsive SVG with Smooth Gradient Areas & Splines
          ----------------------------------------------------------------- */}
      <div className="cashflow-chart-container">
        <svg
          className="cashflow-svg"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Cash Flow Overview Spline Chart"
        >
          <defs>
            {/* Income Gradient Fill (Bright Teal to Transparent) */}
            <linearGradient id="cashflow-income-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e396" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#00e396" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#00e396" stopOpacity="0.00" />
            </linearGradient>

            {/* Expense Gradient Fill (Pink/Red to Transparent) */}
            <linearGradient id="cashflow-expense-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4560" stopOpacity="0.20" />
              <stop offset="65%" stopColor="#ff4560" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ff4560" stopOpacity="0.00" />
            </linearGradient>

            {/* Luminous Glow Filter for Income Teal Line */}
            <filter id="cashflow-glow-income" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#00e396" floodOpacity="0.45" />
            </filter>

            {/* Luminous Glow Filter for Expense Pink Line */}
            <filter id="cashflow-glow-expense" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ff4560" floodOpacity="0.40" />
            </filter>
          </defs>

          {/* Minimal Horizontal Grid Lines & Y-Axis Labels */}
          {gridTicks.map((tick, idx) => (
            <g key={`grid-${idx}`}>
              <line
                x1={PADDING.left - 6}
                y1={tick.y}
                x2={SVG_WIDTH - PADDING.right + 6}
                y2={tick.y}
                className="cashflow-grid-line"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 12}
                y={tick.y + 4}
                textAnchor="end"
                className="cashflow-axis-text"
                fontSize="11"
                fontWeight="500"
                fontFamily="inherit"
              >
                {formatCompactCurrency(tick.val, currency)}
              </text>
            </g>
          ))}

          {/* Income Subtle Gradient Area */}
          <path
            d={incomeAreaPath}
            fill="url(#cashflow-income-grad)"
            pointerEvents="none"
          />

          {/* Expense Subtle Gradient Area */}
          <path
            d={expenseAreaPath}
            fill="url(#cashflow-expense-grad)"
            pointerEvents="none"
          />

          {/* Vertical Hover Guideline */}
          {activeIncPoint && (
            <line
              x1={activeIncPoint.x}
              y1={PADDING.top - 6}
              x2={activeIncPoint.x}
              y2={BASELINE_Y}
              className="cashflow-guideline"
              strokeDasharray="3 3"
              strokeWidth="1.2"
              pointerEvents="none"
            />
          )}

          {/* Expenses Line (Smooth Spline) */}
          <path
            d={expenseLinePath}
            fill="none"
            stroke="#ff4560"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cashflow-glow-expense)"
            pointerEvents="none"
          />

          {/* Income Line (Smooth Spline) */}
          <path
            d={incomeLinePath}
            fill="none"
            stroke="#00e396"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cashflow-glow-income)"
            pointerEvents="none"
          />

          {/* Data Points: Expense Markers */}
          {expensePoints.map((pt, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <g key={`exp-pt-${idx}`} pointerEvents="none">
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="rgba(255, 69, 96, 0.22)"
                    className="cashflow-pulse-ring"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#ff4560"
                  stroke="var(--pl-bg-surface, #131926)"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
              </g>
            )
          })}

          {/* Data Points: Income Markers (Glowing circular markers from screenshot) */}
          {incomePoints.map((pt, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <g key={`inc-pt-${idx}`} pointerEvents="none">
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="14"
                    fill="rgba(0, 227, 150, 0.24)"
                    className="cashflow-pulse-ring"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#00e396"
                  stroke="var(--pl-bg-surface, #131926)"
                  strokeWidth={isHovered ? 2.5 : 2}
                />
              </g>
            )
          })}

          {/* X-Axis Month Labels */}
          {monthsData.map((d, idx) => {
            const pt = incomePoints[idx]
            const isHovered = hoveredIndex === idx
            return (
              <text
                key={`label-${d.key}`}
                x={pt ? pt.x : 0}
                y={BASELINE_Y + 22}
                textAnchor="middle"
                fill={isHovered ? 'var(--pl-text-primary, #f8fafc)' : 'var(--pl-text-muted, #64748b)'}
                fontSize="12"
                fontWeight={isHovered ? '700' : '500'}
                fontFamily="inherit"
              >
                {d.label}
              </text>
            )
          })}

          {/* Invisible Interactive Hitbox Rectangles */}
          {monthsData.map((_, idx) => {
            const pt = incomePoints[idx]
            if (!pt) return null
            const halfCol = colWidth / 2
            const rx = idx === 0 ? pt.x - 20 : pt.x - halfCol
            const rw = (idx === 0 || idx === monthsData.length - 1) ? halfCol + 20 : colWidth

            return (
              <rect
                key={`hitbox-${idx}`}
                x={rx}
                y={PADDING.top}
                width={rw}
                height={PLOT_HEIGHT + 35}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`${monthsData[idx].fullMonthName} data`}
              />
            )
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activeMonth && tooltipStyle && (
          <div className="cashflow-tooltip" style={tooltipStyle}>
            <div className="cashflow-tooltip-header">
              <span className="cashflow-tooltip-month">{activeMonth.fullMonthName}</span>
            </div>
            <div className="cashflow-tooltip-body">
              <div className="cashflow-tooltip-row">
                <div className="cashflow-tooltip-label">
                  <span className="cashflow-legend-dot income" />
                  <span>Income</span>
                </div>
                <span className="cashflow-tooltip-val income">
                  +{money(activeMonth.income, currency)}
                </span>
              </div>
              <div className="cashflow-tooltip-row">
                <div className="cashflow-tooltip-label">
                  <span className="cashflow-legend-dot expense" />
                  <span>Expenses</span>
                </div>
                <span className="cashflow-tooltip-val expense">
                  -{money(activeMonth.expense, currency)}
                </span>
              </div>
              <div className="cashflow-tooltip-divider" />
              <div className="cashflow-tooltip-row net">
                <span className="cashflow-tooltip-label">Net Flow</span>
                <span className={`cashflow-tooltip-val ${activeMonth.net >= 0 ? 'pos' : 'neg'}`}>
                  {activeMonth.net >= 0 ? '+' : '-'}
                  {money(Math.abs(activeMonth.net), currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gentle notice if no transactions exist in the 6-month window */}
      {!hasAnyData && (
        <div className="cashflow-empty-notice">
          <span>No income or expense records found for this 6-month window.</span>
        </div>
      )}
    </section>
  )
}

export default CashFlowOverview
