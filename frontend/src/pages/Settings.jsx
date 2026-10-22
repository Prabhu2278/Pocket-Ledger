import React, { useState, useEffect } from 'react'
import { authApi } from '../services/authApi'
import { ConfirmModal } from '../components/ConfirmDialog'

const DARK_THEMES = [
  {
    id: 'dark',
    name: 'Midnight Dark',
    category: 'Fintech Slate',
    description: 'Deep navy background with high-contrast text and glowing indigo accents.',
    swatches: ['#818cf8', '#131926', '#34d399', '#f87171'],
    preview: {
      bg: '#0a0e17',
      card: '#131926',
      accent: '#818cf8',
      border: '#1e293e',
      text: '#f8fafc',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Wealth',
    category: 'Forest Jade',
    description: 'Deep forest obsidian theme with glowing mint emerald and jade accents.',
    swatches: ['#10b981', '#0b241c', '#34d399', '#f87171'],
    preview: {
      bg: '#051410',
      card: '#0b241c',
      accent: '#10b981',
      border: '#174233',
      text: '#f0fdf4',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Sapphire',
    category: 'Marine Cyan',
    description: 'Deep oceanic blues with electric cyan highlights and high visual clarity.',
    swatches: ['#0ea5e9', '#0b1e36', '#10b981', '#f43f5e'],
    preview: {
      bg: '#06111f',
      card: '#0b1e36',
      accent: '#0ea5e9',
      border: '#173b66',
      text: '#f0f9ff',
    },
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    category: 'Cosmic Nebula',
    description: 'Rich royal purple with vivid neon violet accents and deep nebula tones.',
    swatches: ['#a855f7', '#18112d', '#10b981', '#f43f5e'],
    preview: {
      bg: '#0f0a1d',
      card: '#18112d',
      accent: '#a855f7',
      border: '#342460',
      text: '#faf5ff',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Amber',
    category: 'Golden Bronze',
    description: 'Warm twilight obsidian with vibrant amber and gold financial highlights.',
    swatches: ['#f59e0b', '#20150d', '#10b981', '#f43f5e'],
    preview: {
      bg: '#140d07',
      card: '#20150d',
      accent: '#f59e0b',
      border: '#432e1c',
      text: '#fffbeb',
    },
  },
]

const LIGHT_THEMES = [
  {
    id: 'light',
    name: 'Crisp Daylight',
    category: 'Clean Daylight',
    description: 'Clean white cards with soft grayish-blue background and classic indigo tones.',
    swatches: ['#4f46e5', '#ffffff', '#15803d', '#b91c1c'],
    preview: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#4f46e5',
      border: '#e2e8f0',
      text: '#0f172a',
    },
  },
  {
    id: 'light-emerald',
    name: 'Mint Meadow',
    category: 'Spring Sage',
    description: 'Fresh spring mint with soft jade borders and clean white surfaces.',
    swatches: ['#059669', '#ffffff', '#10b981', '#dc2626'],
    preview: {
      bg: '#f0fdf4',
      card: '#ffffff',
      accent: '#059669',
      border: '#bbf7d0',
      text: '#06241a',
    },
  },
  {
    id: 'light-ocean',
    name: 'Glacier Azure',
    category: 'Breeze Sky',
    description: 'Cool sky blue with arctic azure accents and high-contrast readability.',
    swatches: ['#0284c7', '#ffffff', '#059669', '#e11d48'],
    preview: {
      bg: '#f0f9ff',
      card: '#ffffff',
      accent: '#0284c7',
      border: '#bae6fd',
      text: '#082136',
    },
  },
  {
    id: 'light-violet',
    name: 'Lavender Whisper',
    category: 'Royal Lilac',
    description: 'Gentle lavender background with rich royal purple accents and elegant cards.',
    swatches: ['#7c3aed', '#ffffff', '#059669', '#e11d48'],
    preview: {
      bg: '#faf5ff',
      card: '#ffffff',
      accent: '#7c3aed',
      border: '#e9d5ff',
      text: '#1d0e3b',
    },
  },
  {
    id: 'light-sunset',
    name: 'Champagne Sand',
    category: 'Warm Honey',
    description: 'Warm ivory background with golden amber and warm bronze accents.',
    swatches: ['#d97706', '#ffffff', '#059669', '#dc2626'],
    preview: {
      bg: '#fffbeb',
      card: '#ffffff',
      accent: '#d97706',
      border: '#fde68a',
      text: '#2b1807',
    },
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
}) {
  const [activeTab, setActiveTab] = useState('profile')
  const [themeModeFilter, setThemeModeFilter] = useState('all') // 'all' | 'dark' | 'light'

  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [profileSaving, setProfileSaving] = useState(false)

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

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr)
    if (user) {
      authApi.updateProfile({ currency: newCurr }).catch(() => { })
    }
    showToast(`Currency changed to ${newCurr}`)
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
    const isSelected = theme === t.id
    return (
      <div
        key={t.id}
        className="theme-card"
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
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.swatches[0], display: 'inline-block' }}></span>
            </div>
            <div className="theme-card-names">
              <span className="theme-card-name">{t.name}</span>
              <span className="theme-card-category">{t.category}</span>
            </div>
          </div>
          {isSelected && (
            <span className="theme-card-status">
              ✓ Active
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
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ width: '36px', height: '4px', background: t.preview.text, opacity: 0.5, borderRadius: '2px' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.preview.accent }}></span>
            </div>
            <span style={{ width: '52px', height: '5px', background: t.preview.accent, borderRadius: '2px' }}></span>
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
                onClick={() => setActiveTab(tab.id)}
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
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--pl-radius-pill)', background: 'var(--pl-color-primary-soft)', color: 'var(--pl-color-primary)' }}>
                  10 curated palettes (5 Dark &bull; 5 Light)
                </span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--mute)' }}>
                Personalize your workspace with 10 curated financial color palettes. Each theme automatically customizes accents, cards, and data visuals.
              </p>

              {/* Theme Mode Filter Filter Tabs */}
              <div className="theme-category-tabs" role="tablist" aria-label="Filter theme modes">
                <button
                  type="button"
                  className={`theme-category-pill ${themeModeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setThemeModeFilter('all')}
                >
                  All Palettes (10)
                </button>
                <button
                  type="button"
                  className={`theme-category-pill ${themeModeFilter === 'dark' ? 'active' : ''}`}
                  onClick={() => setThemeModeFilter('dark')}
                >
                  🌙 Dark Themes (5)
                </button>
                <button
                  type="button"
                  className={`theme-category-pill ${themeModeFilter === 'light' ? 'active' : ''}`}
                  onClick={() => setThemeModeFilter('light')}
                >
                  ☀️ Light Themes (5)
                </button>
              </div>

              {/* Dark Themes Section */}
              {(themeModeFilter === 'all' || themeModeFilter === 'dark') && (
                <div style={{ marginBottom: '28px' }}>
                  <div className="theme-group-header">
                    <span className="theme-group-title">
                      🌙 Dark Themes (5 Options)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)' }}>High-contrast dark modes</span>
                  </div>
                  <div className="theme-options">
                    {DARK_THEMES.map(renderThemeCard)}
                  </div>
                </div>
              )}

              {/* Light Themes Section */}
              {(themeModeFilter === 'all' || themeModeFilter === 'light') && (
                <div>
                  <div className="theme-group-header">
                    <span className="theme-group-title">
                      ☀️ Light Themes (5 Options)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--pl-text-muted)' }}>Clean, daylight-optimized palettes</span>
                  </div>
                  <div className="theme-options">
                    {LIGHT_THEMES.map(renderThemeCard)}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="card" id="panel-currency" role="tabpanel" aria-labelledby="tab-currency">
              <h2>Currency formatting</h2>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--mute)' }}>
                Select your preferred currency for display across transactions, cards, and reports.
              </p>
              <div className="chips" role="radiogroup" aria-label="Select currency">
                {[
                  ['INR', '₹ Indian Rupee (INR)'],
                  ['USD', '$ US Dollar (USD)'],
                  ['EUR', '€ Euro (EUR)'],
                  ['GBP', '£ British Pound (GBP)'],
                ].map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    className="chip"
                    aria-pressed={currency === code}
                    onClick={() => handleCurrencyChange(code)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
    </section>
  )
}

export default Settings
