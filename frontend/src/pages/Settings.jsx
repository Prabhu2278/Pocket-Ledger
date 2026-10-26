import React, { useState, useEffect, useMemo } from 'react'
import { authApi } from '../services/authApi'
import { settingsApi } from '../services/settingsApi'
import { ConfirmModal } from '../components/ConfirmDialog'
import { CategoriesTab } from '../components/categories/CategoriesTab'
import { AddCurrencyModal } from '../components/AddCurrencyModal'
import {
  DEFAULT_CURRENCIES,
  POPULAR_CURRENCIES,
  getCustomCurrencies,
  saveCustomCurrency,
  removeCustomCurrency,
} from '../utils/formatCurrency'

const APP_THEMES = [
  {
    id: 'light',
    name: 'Light Mode',
    category: 'Vibrant Daylight',
    description: 'Crisp, daylight-optimized design with colorful iridescent ambient background, frosted glass cards, and royal purple accents.',
    swatches: ['#5247e8', '#ffffff', '#10b981', '#ec4899'],
    preview: {
      bg: 'linear-gradient(135deg, #eef2ff, #fae8ff, #ecfdf5)',
      card: '#ffffff',
      accent: '#5247e8',
      border: '#e2e8f0',
      text: '#0f172a',
    },
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    category: 'Midnight Obsidian',
    description: 'Deep cyber navy obsidian workspace with glowing indigo and emerald aura, high-contrast typography, and dark frosted surfaces.',
    swatches: ['#818cf8', '#0f172a', '#34d399', '#f87171'],
    preview: {
      bg: 'radial-gradient(circle at 50% 50%, #0d1322 0%, #070a12 100%)',
      card: '#0f172a',
      accent: '#818cf8',
      border: 'rgba(255, 255, 255, 0.12)',
      text: '#f8fafc',
    },
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
]

const SETTINGS_TABS = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Themes & Colors',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'currency',
    label: 'Currency',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
        <path d="M12 6v2m0 8v2" />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security & Account',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
]

export function Settings({
  user,
  onUserUpdate,
  onLogout,
  theme,
  setTheme,
  currency,
  setCurrency,
  showToast,
  categories = [],
  onCategoriesChange,
}) {
  const getTabFromLocation = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('tab=appearance') || hash.includes('tab=theme') || hash.includes('/appearance') || hash.includes('/theme')) return 'appearance'
      if (hash.includes('tab=currency') || hash.includes('/currency')) return 'currency'
      if (hash.includes('tab=categories') || hash.includes('/categories')) return 'categories'
      if (hash.includes('tab=security') || hash.includes('/security')) return 'security'
      if (hash.includes('profile')) return 'profile'
    }
    return 'profile'
  }

  const [activeTab, setActiveTab] = useState(() => getTabFromLocation())

  useEffect(() => {
    const handleSyncTab = () => {
      const tab = getTabFromLocation()
      if (tab) setActiveTab(tab)
    }
    const handleCustomTab = (e) => {
      if (e?.detail) setActiveTab(e.detail)
    }
    window.addEventListener('hashchange', handleSyncTab)
    window.addEventListener('settings-tab-change', handleCustomTab)
    return () => {
      window.removeEventListener('hashchange', handleSyncTab)
      window.removeEventListener('settings-tab-change', handleCustomTab)
    }
  }, [])

  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [profileSaving, setProfileSaving] = useState(false)

  const activeCurrency = currency || 'INR'

  // Currency saving state
  const [currencySaving, setCurrencySaving] = useState(false)
  const [targetCurrency, setTargetCurrency] = useState(null)
  const [customCurrencies, setCustomCurrencies] = useState(() => getCustomCurrencies())
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false)

  // Confirmation modals state for currency selection and deletion
  const [currencyToSelect, setCurrencyToSelect] = useState(null)
  const [showCurrencySelectConfirm, setShowCurrencySelectConfirm] = useState(false)
  const [currencyToDelete, setCurrencyToDelete] = useState(null)
  const [showCurrencyDeleteConfirm, setShowCurrencyDeleteConfirm] = useState(false)

  // Compute displayed currencies (default 4 + custom + active)
  const displayedCurrencies = useMemo(() => {
    const list = [...DEFAULT_CURRENCIES]
    const defaultCodes = new Set(DEFAULT_CURRENCIES.map((c) => c.code))

    // Add saved custom currencies
    customCurrencies.forEach((curr) => {
      if (!defaultCodes.has(curr.code)) {
        list.push(curr)
        defaultCodes.add(curr.code)
      }
    })

    // If activeCurrency is set and not in list, find it in popular currencies or add it
    if (activeCurrency && !defaultCodes.has(activeCurrency)) {
      const match = POPULAR_CURRENCIES.find((c) => c.code === activeCurrency)
      if (match) {
        list.push(match)
      } else {
        list.push({
          code: activeCurrency,
          name: activeCurrency,
          symbol: activeCurrency,
          label: `${activeCurrency} (${activeCurrency})`,
        })
      }
    }

    return list
  }, [customCurrencies, activeCurrency])

  // Password state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name)
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setProfileSaving(true)
    try {
      if (user) {
        const updated = await authApi.updateProfile({ full_name: fullName.trim() })
        onUserUpdate(updated)
      }
      showToast('Profile updated successfully')
    } catch (err) {
      showToast(err.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const executeCurrencyChange = async (newCurr) => {
    if (newCurr === activeCurrency) return
    setCurrencySaving(true)
    setTargetCurrency(newCurr)
    try {
      await settingsApi.updateCurrency(newCurr)
      setCurrency(newCurr)
      if (user && onUserUpdate) {
        onUserUpdate({ ...user, currency: newCurr })
      }
      showToast(`Currency changed to ${newCurr}`)
    } catch (err) {
      showToast(err.message || 'Failed to update currency')
    } finally {
      setCurrencySaving(false)
      setTargetCurrency(null)
    }
  }

  // Request currency change (prompts for Yes / No confirmation)
  const handleRequestCurrencyChange = (curr) => {
    const code = typeof curr === 'string' ? curr : curr.code
    if (code === activeCurrency) return
    const found = displayedCurrencies.find((c) => c.code === code) || { code, name: code, symbol: code }
    setCurrencyToSelect(found)
    setShowCurrencySelectConfirm(true)
  }

  const handleConfirmCurrencyChange = async () => {
    if (!currencyToSelect) return
    const code = currencyToSelect.code
    setShowCurrencySelectConfirm(false)
    setCurrencyToSelect(null)
    await executeCurrencyChange(code)
  }

  // Adding new currency adds it to options but does NOT auto-switch active currency
  const handleSelectNewCurrency = (newCurr) => {
    const code = (newCurr.code || '').toUpperCase()
    if (!code) return
    const isDefault = DEFAULT_CURRENCIES.some((d) => d.code === code)
    if (!isDefault) {
      saveCustomCurrency(newCurr)
      setCustomCurrencies(getCustomCurrencies())
    }
    showToast(`Added ${code} to currency options. Select it whenever you wish to switch.`)
  }

  // Request removal of custom currency (prompts for Yes / No confirmation)
  const handleRequestRemoveCustomCurrency = (e, curr) => {
    e.stopPropagation()
    const code = typeof curr === 'string' ? curr : curr.code
    const found = displayedCurrencies.find((c) => c.code === code) || { code, name: code }
    setCurrencyToDelete(found)
    setShowCurrencyDeleteConfirm(true)
  }

  const handleConfirmRemoveCustomCurrency = () => {
    if (!currencyToDelete) return
    const codeToRemove = currencyToDelete.code
    setShowCurrencyDeleteConfirm(false)
    setCurrencyToDelete(null)

    const updated = removeCustomCurrency(codeToRemove)
    setCustomCurrencies(updated)
    if (activeCurrency === codeToRemove) {
      executeCurrencyChange('INR')
    }
    showToast(`Removed ${codeToRemove} from currency options`)
  }

  const [showPwConfirm, setShowPwConfirm] = useState(false)

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPwError('')
    if (!currentPw) {
      setPwError('Enter your current password.')
      return
    }
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.')
      return
    }

    // All validations passed, prompt user for confirmation
    setShowPwConfirm(true)
  }

  const handleConfirmChangePassword = async () => {
    setShowPwConfirm(false)
    setPwSaving(true)
    try {
      await authApi.changePassword({
        current_password: currentPw,
        new_password: newPw,
      })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      showToast('Password changed successfully')
    } catch (err) {
      setPwError(err.message || 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const renderThemeCard = (t) => {
    const isSelected = (theme === 'dark' && t.id === 'dark') || (theme !== 'dark' && t.id === 'light')
    return (
      <div
        key={t.id}
        className={`theme-card ${isSelected ? 'selected' : ''}`}
        role="radio"
        aria-checked={isSelected}
        onClick={() => {
          setTheme(t.id)
          showToast(`Theme updated to ${t.name}`)
        }}
        style={{
          '--theme-preview-color': t.swatches[0],
          '--theme-preview-accent': `${t.swatches[0]}22`,
        }}
      >
        <div className="theme-card-top">
          <div className="theme-card-title-group">
            <div className="theme-icon-box">
              {t.icon}
            </div>
            <div className="theme-card-names">
              <span className="theme-card-name">{t.name}</span>
              <span className="theme-card-category">{t.category}</span>
            </div>
          </div>
          {isSelected && (
            <span className="theme-card-status">
              Active
            </span>
          )}
        </div>

        {/* Visual Color Palette Swatches */}
        <div className="theme-palette-swatches" aria-label={`${t.name} color palette`}>
          {t.swatches.map((color, idx) => (
            <span
              key={idx}
              className="theme-swatch"
              style={{ background: color }}
              title={`Palette color: ${color}`}
            />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)', marginLeft: '4px', fontWeight: 600 }}>
            Palette
          </span>
        </div>

        {/* Miniature Interface Mockup Preview */}
        <div
          className="theme-preview-mini"
          style={{ background: t.preview.bg }}
        >
          <div
            style={{
              background: t.preview.card,
              border: `1px solid ${t.preview.border}`,
              borderTop: `2.5px solid ${t.preview.accent}`,
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ width: '40px', height: '5px', background: t.preview.text, opacity: 0.5, borderRadius: '2px' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.preview.accent }}></span>
            </div>
            <span style={{ width: '60px', height: '6px', background: t.preview.accent, borderRadius: '2px' }}></span>
          </div>
        </div>

        <p className="theme-card-desc">{t.description}</p>
      </div>
    )
  }

  return (
    <section className="view on" id="v-settings" aria-label="Settings module">
      <div className="settings-container">
        {/* Top Header Navigation Tabs */}
        <div className="settings-tabs-header" role="tablist" aria-label="Settings navigation">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (typeof window !== 'undefined') {
                    window.location.hash = `#/settings?tab=${tab.id}`
                  }
                }}
              >
                <span className="settings-tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels - Only active tab page is shown */}
        <div className="settings-tab-content">
          {activeTab === 'profile' && (
            <div className="card" id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
              <h2>Profile settings</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--mute)' }}>
                Manage your display name and view your connected account details.
              </p>
              <form onSubmit={handleSaveProfile} className="f" style={{ maxWidth: '480px' }}>
                <label>
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your display name"
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={user?.email || 'Logged in user'}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </label>

                <div>
                  <button className="primary" type="submit" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card" id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <h2 style={{ margin: 0 }}>Theme preferences</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--pl-radius-pill)', background: 'var(--pl-color-primary-soft)', color: 'var(--pl-color-primary)' }}>
                  {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                </span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--mute)' }}>
                Choose your preferred interface theme. Select between crisp daylight mode and midnight obsidian dark mode.
              </p>

              <div className="theme-options theme-options-dual">
                {APP_THEMES.map(renderThemeCard)}
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="card" id="panel-currency" role="tabpanel" aria-labelledby="tab-currency">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <h2 style={{ margin: 0 }}>Currency formatting</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--pl-radius-pill)', background: 'var(--pl-color-primary-soft)', color: 'var(--pl-color-primary)' }}>
                  Default: Indian Rupee (INR)
                </span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--mute)' }}>
                Select your preferred currency for display across transactions, cards, and reports.
              </p>
              <div className="chips" role="radiogroup" aria-label="Select currency" style={{ alignItems: 'center', gap: '8px' }}>
                {displayedCurrencies.map((c) => {
                  const code = c.code
                  const label = c.label || `${c.symbol} ${c.name} (${code})`
                  const isSelected = activeCurrency === code
                  const isSavingThis = currencySaving && targetCurrency === code
                  const isCustom = !DEFAULT_CURRENCIES.some((d) => d.code === code)

                  return (
                    <button
                      key={code}
                      type="button"
                      className="chip"
                      aria-pressed={isSelected}
                      disabled={currencySaving}
                      onClick={() => handleRequestCurrencyChange(c)}
                      style={{
                        position: 'relative',
                        opacity: currencySaving && !isSavingThis ? 0.7 : 1,
                        cursor: currencySaving ? 'wait' : 'pointer',
                        paddingRight: isCustom ? '8px' : '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{label}</span>
                      {isSavingThis && (
                        <span style={{ fontSize: '11px', opacity: 0.85 }}>
                          (Saving...)
                        </span>
                      )}
                      {isCustom && (
                        <span
                          role="button"
                          tabIndex={0}
                          title={`Remove ${code}`}
                          aria-label={`Delete ${code}`}
                          onClick={(e) => handleRequestRemoveCustomCurrency(e, c)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRequestRemoveCustomCurrency(e, c)
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '4px',
                            padding: '1px 5px',
                            borderRadius: '50%',
                            fontSize: '13px',
                            lineHeight: 1,
                            opacity: 0.7,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
                        >
                          &times;
                        </span>
                      )}
                    </button>
                  )
                })}

                {/* + Add Currency Button */}
                <button
                  type="button"
                  id="btn-add-currency"
                  className="chip add-currency-btn"
                  onClick={() => setShowAddCurrencyModal(true)}
                  disabled={currencySaving}
                  title="Add new currency"
                  style={{
                    borderStyle: 'dashed',
                    borderColor: 'var(--pl-color-primary, #818cf8)',
                    color: 'var(--pl-color-primary, #818cf8)',
                    background: 'var(--pl-color-primary-soft, rgba(129, 140, 248, 0.08))',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Currency</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              onCategoriesChange={onCategoriesChange}
              showToast={showToast}
              user={user}
            />
          )}

          {activeTab === 'security' && (
            <div className="card" id="panel-security" role="tabpanel" aria-labelledby="tab-security">
              <h2>Account & security</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <form onSubmit={handleChangePassword} className="f" style={{ maxWidth: '480px' }}>
                  <h3 style={{ fontSize: '14px', margin: '0 0 4px', fontWeight: 700 }}>
                    Change password
                  </h3>

                  <label>
                    Current password
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                    />
                  </label>

                  <label>
                    New password
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                    />
                  </label>

                  <label>
                    Confirm new password
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                    />
                  </label>

                  {pwError && (
                    <p className="err" role="alert">
                      {pwError}
                    </p>
                  )}

                  <div>
                    <button className="ghost" type="submit" disabled={pwSaving}>
                      {pwSaving ? 'Updating password...' : 'Update password'}
                    </button>
                  </div>
                </form>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', margin: '0 0 6px', fontWeight: 700 }}>
                    Session
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--mute)' }}>
                    Sign out of your active account session. You will be redirected to the sign-in screen.
                  </p>
                  <button
                    type="button"
                    className="ghost"
                    onClick={onLogout}
                    style={{ color: 'var(--out)' }}
                  >
                    Log out of Pocket Ledger
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Update Confirmation Alert */}
      <ConfirmModal
        isOpen={showPwConfirm}
        title="Update Account Password?"
        message="Are you sure you want to update your password? You will need to use your new password next time you sign in."
        confirmText="Update Password"
        cancelText="Cancel"
        variant="primary"
        isLoading={pwSaving}
        onConfirm={handleConfirmChangePassword}
        onCancel={() => setShowPwConfirm(false)}
      />

      {/* Currency Selection Confirmation Modal (Yes / No) */}
      <ConfirmModal
        isOpen={showCurrencySelectConfirm}
        title="Change Currency?"
        message={`Are you sure you want to change your preferred currency to ${currencyToSelect?.name || currencyToSelect?.code} (${currencyToSelect?.symbol || currencyToSelect?.code})?`}
        confirmText="Yes"
        cancelText="No"
        variant="primary"
        isLoading={currencySaving}
        onConfirm={handleConfirmCurrencyChange}
        onCancel={() => {
          setShowCurrencySelectConfirm(false)
          setCurrencyToSelect(null)
        }}
      />

      {/* Currency Deletion Confirmation Modal (Yes / No) */}
      <ConfirmModal
        isOpen={showCurrencyDeleteConfirm}
        title="Delete Currency?"
        message={`Are you sure you want to delete ${currencyToDelete?.name || currencyToDelete?.code} (${currencyToDelete?.code}) from your currency options?`}
        confirmText="Yes"
        cancelText="No"
        variant="danger"
        onConfirm={handleConfirmRemoveCustomCurrency}
        onCancel={() => {
          setShowCurrencyDeleteConfirm(false)
          setCurrencyToDelete(null)
        }}
      />

      {/* Add Currency Modal */}
      <AddCurrencyModal
        isOpen={showAddCurrencyModal}
        onClose={() => setShowAddCurrencyModal(false)}
        onSelectCurrency={handleSelectNewCurrency}
        existingCodes={displayedCurrencies.map((c) => c.code)}
        activeCurrency={activeCurrency}
      />
    </section>
  )
}

export default Settings
