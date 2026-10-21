import React, { useState, useEffect } from 'react'
import { money } from '../utils/formatCurrency'
import { authApi } from '../services/authApi'

export function Settings({
  user,
  onUserUpdate,
  onLogout,
  theme,
  setTheme,
  currency,
  setCurrency,
  budget,
  onUpdateBudget,
  showToast,
}) {
  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [profileSaving, setProfileSaving] = useState(false)

  // Budget state
  const [budgetVal, setBudgetVal] = useState(String(budget))
  const [budgetSaving, setBudgetSaving] = useState(false)

  // Password state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name)
  }, [user])

  useEffect(() => {
    setBudgetVal(String(budget))
  }, [budget])

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

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    const numericBudget = parseFloat(budgetVal)
    if (isNaN(numericBudget) || numericBudget < 0) return
    setBudgetSaving(true)
    try {
      await onUpdateBudget(numericBudget)
      showToast(`Monthly budget updated to ${money(numericBudget, currency)}`)
    } catch (err) {
      showToast('Failed to update budget')
    } finally {
      setBudgetSaving(false)
    }
  }

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr)
    if (user) {
      authApi.updateProfile({ currency: newCurr }).catch(() => { })
    }
    showToast(`Currency changed to ${newCurr}`)
  }

  const handleChangePassword = async (e) => {
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

  return (
    <section className="view on" id="v-settings" aria-label="Settings module">
      <div className="settings-container">
        {/* A. Profile Settings */}
        <div className="card">
          <h2>Profile settings</h2>
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
                value={user?.email || 'Guest user'}
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

        {/* B. Theme Settings */}
        <div className="card">
          <h2>Theme preferences</h2>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--mute)' }}>
            Choose between the crisp light appearance or the comfortable dark mode.
          </p>
          <div className="theme-options">
            <div
              className="theme-card"
              role="radio"
              aria-checked={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>☀️</span>
                <b>Light mode</b>
              </div>
              <p>Clean white cards with soft grayish-blue background.</p>
            </div>

            <div
              className="theme-card"
              role="radio"
              aria-checked={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🌙</span>
                <b>Dark mode</b>
              </div>
              <p>Deep navy background with high-contrast text and glowing accents.</p>
            </div>
          </div>
        </div>

        {/* C. Monthly Budget Settings */}
        <div className="card">
          <h2>Monthly budget settings</h2>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--mute)' }}>
            Configure your monthly spending target. Your budget progress ring adjusts automatically.
          </p>
          <form onSubmit={handleSaveBudget} className="f" style={{ maxWidth: '360px' }}>
            <label>
              Monthly target amount ({currency})
              <input
                type="number"
                min="0"
                step="500"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                required
              />
            </label>

            <div>
              <button className="primary" type="submit" disabled={budgetSaving}>
                {budgetSaving ? 'Updating...' : 'Update monthly budget'}
              </button>
            </div>
          </form>
        </div>

        {/* D. Currency Settings */}
        <div className="card">
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

        {/* E. Account Settings */}
        <div className="card">
          <h2>Account & security</h2>
          {user ? (
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
                  Sign out of this browser session.
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
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--mute)' }}>
                You are currently browsing as a guest. Create an account to isolate and protect your data.
              </p>
              <a href="#/login" className="primary" style={{ textDecoration: 'none' }}>
                Sign in or register
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Settings
