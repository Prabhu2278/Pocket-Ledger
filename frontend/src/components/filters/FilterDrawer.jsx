import React from 'react'
import { ExpenseFilters } from '../ExpenseFilters'

export function FilterDrawer({ isOpen, onClose, filter, setFilter }) {
  if (!isOpen) return null

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div
        className="pocket-filter-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          background: 'var(--pocket-card)',
          borderLeft: '1px solid var(--pocket-line)',
          padding: '24px',
          zIndex: 1000,
          boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Filters</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '20px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--pocket-muted)' }}>
            Filter by Category:
          </label>
          <ExpenseFilters filter={filter} setFilter={setFilter} />
        </div>
      </div>
    </div>
  )
}

export default FilterDrawer
