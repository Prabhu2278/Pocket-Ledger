import React, { useMemo } from 'react'
import { money } from '../../../utils/formatCurrency'
import { getCategoryColor } from '../../../constants/categories'

export function SpendingCategoryCard({ categoryTotals = {} }) {
  const entries = useMemo(() => {
    return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  }, [categoryTotals])

  const total = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)
  }, [categoryTotals])

  return (
    <div className="pocket-ledger-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2>Spending by Category</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--pocket-muted)' }}>
            Breakdown across budget categories
          </p>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pocket-muted)' }}>
          {entries.length} Categories
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
        {entries.length === 0 && (
          <div style={{ color: 'var(--pocket-muted)', textAlign: 'center', padding: '24px 0' }}>
            No category expenditures recorded this month.
          </div>
        )}

        {entries.slice(0, 5).map(([cat, amount]) => {
          const color = getCategoryColor ? getCategoryColor(cat) : '#10b981'
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0

          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 8px ${color}88`,
                    }}
                  />
                  <strong style={{ color: 'var(--pocket-ink)' }}>{cat}</strong>
                  <span style={{ color: 'var(--pocket-muted)', fontSize: '12px' }}>({pct}%)</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--pocket-ink)' }}>{money(amount)}</span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '6px',
                  background: 'var(--pocket-line)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SpendingCategoryCard
