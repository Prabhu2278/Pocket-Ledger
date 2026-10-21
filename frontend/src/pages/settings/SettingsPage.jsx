import React, { useState } from 'react'
import { SecurityTab } from './components/SecurityTab'
import { GeneralTab } from './components/GeneralTab'
import { DataTab } from './components/DataTab'
import { CategoriesTab } from './components/CategoriesTab'
import './Settings.css'

export function SettingsPage() {
  const [tab, setTab] = useState('general')

  return (
    <section className="pocket-ledger-expenses-view" aria-label="Application Settings">
      <div className="pocket-settings-nav" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--pocket-line)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`pocket-type-pill ${tab === 'general' ? 'pocket-type-active' : ''}`}
          onClick={() => setTab('general')}
        >
          General
        </button>
        <button
          type="button"
          className={`pocket-type-pill ${tab === 'security' ? 'pocket-type-active' : ''}`}
          onClick={() => setTab('security')}
        >
          Security
        </button>
        <button
          type="button"
          className={`pocket-type-pill ${tab === 'categories' ? 'pocket-type-active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          className={`pocket-type-pill ${tab === 'data' ? 'pocket-type-active' : ''}`}
          onClick={() => setTab('data')}
        >
          Data & Backup
        </button>
      </div>

      <div className="pocket-ledger-card">
        {tab === 'general' && <GeneralTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'data' && <DataTab />}
      </div>
    </section>
  )
}

export default SettingsPage
