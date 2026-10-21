import React, { useMemo } from 'react'
import { money } from '../../../utils/formatCurrency'

export function WeeklySpendingChart({ monthTransactions = [] }) {
  // Compute spending for the last 7 calendar days
  const last7Days = useMemo(() => {
    const today = new Date()
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' })
      const dateNum = d.getDate()
      days.push({ dateStr, dayLabel, dateNum, total: 0 })
    }

    monthTransactions.forEach((tx) => {
      const txDate = (tx.date || '').slice(0, 10)
      const amt = Number(tx.amt || tx.amount) || 0
      const type = (tx.type || 'EXPENSE').toUpperCase()
      if (type === 'EXPENSE') {
        const found = days.find((item) => item.dateStr === txDate)
        if (found) {
          found.total += amt
        }
      }
    })

    return days
  }, [monthTransactions])

  const maxDaily = useMemo(() => {
    const max = Math.max(...last7Days.map((d) => d.total), 1)
    return max
  }, [last7Days])

  const totalLast7 = useMemo(() => {
    return last7Days.reduce((sum, d) => sum + d.total, 0)
  }, [last7Days])

  return (
    <div className="pocket-ledger-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h2>Last 7 Days Spending</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--pocket-muted)' }}>
            Daily spending velocity over the past week
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pocket-muted)', display: 'block' }}>7-Day Total</span>
          <strong style={{ fontSize: '16px', color: 'var(--pocket-ink)' }}>{money(totalLast7)}</strong>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          alignItems: 'flex-end',
          height: '180px',
          padding: '16px 8px 8px',
          background: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          border: '1px solid var(--pocket-line)',
        }}
      >
        {last7Days.map((d, idx) => {
          const heightPercent = d.total > 0 ? Math.max((d.total / maxDaily) * 100, 12) : 4
          const isToday = idx === 6

          return (
            <div
              key={d.dateStr}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              {d.total > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isToday ? 'var(--pocket-accent)' : 'var(--pocket-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ₹{d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : d.total}
                </span>
              )}

              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPercent}%`,
                  background: isToday
                    ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                    : d.total > 0
                    ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.6) 0%, rgba(16, 185, 129, 0.3) 100%)'
                    : 'var(--pocket-line)',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.4s ease',
                  boxShadow: isToday ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
                title={`${d.dayLabel} (${d.dateStr}): ${money(d.total)}`}
              />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--pocket-accent)' : 'var(--pocket-muted)' }}>
                  {d.dayLabel}
                </span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--pocket-muted)', opacity: 0.8 }}>
                  {d.dateNum}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklySpendingChart
