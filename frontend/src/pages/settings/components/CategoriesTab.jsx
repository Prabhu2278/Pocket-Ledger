import React from 'react'
import { CATEGORIES } from '../../../constants/categories'

export function CategoriesTab() {
  return (
    <div className="pocket-settings-section">
      <h3>Active Categories</h3>
      <p className="pocket-settings-desc">Color-coded classifications used for auto-categorization</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
        {CATEGORIES.map(([name, color]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'var(--pocket-card)',
              border: '1px solid var(--pocket-line)',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoriesTab
