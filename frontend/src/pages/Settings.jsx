import React, { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function Settings({ showToast }) {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark'
  })

  const toggleDarkMode = () => {
    const nextTheme = !darkMode ? 'dark' : 'light'
    setDarkMode(!darkMode)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('pocket-theme', nextTheme)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!currentPwd || !newPwd || !confirmPwd) {
      if (showToast) showToast('Please fill out all password fields')
      return
    }
    if (newPwd !== confirmPwd) {
      if (showToast) showToast('New passwords do not match')
      return
    }
    // Show Yes/No alert dialog as explicitly requested by user
    setShowConfirmModal(true)
  }

  const handleConfirmPasswordChange = () => {
    setShowConfirmModal(false)
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    if (showToast) showToast('Password changed successfully')
  }

  return (
    <section className="pocket-ledger-expenses-view" aria-label="Settings module">
      <div className="pocket-ledger-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h2>Appearance</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
          <div>
            <b>Dark Theme</b>
            <div style={{ color: 'var(--pocket-muted)', fontSize: '13px' }}>
              Switch between light and dark visual aesthetics
            </div>
          </div>
          <button
            type="button"
            className="pocket-ledger-ghost-button"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--pocket-line)', margin: '24px 0' }} />

        <h2>Security & Password</h2>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
          <label className="pocket-ledger-form-label">
            Current Password
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </label>

          <label className="pocket-ledger-form-label">
            New Password
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </label>

          <label className="pocket-ledger-form-label">
            Confirm New Password
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </label>

          <div style={{ marginTop: '8px' }}>
            <button type="submit" className="pocket-ledger-primary-button">
              Update Password
            </button>
          </div>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--pocket-line)', margin: '24px 0' }} />

        <h2>Data Management</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
          <div>
            <b>Clear Local Storage</b>
            <div style={{ color: 'var(--pocket-muted)', fontSize: '13px' }}>
              Reset client-side cache and reload defaults
            </div>
          </div>
          <button
            type="button"
            className="pocket-ledger-ghost-button"
            style={{ color: 'var(--pocket-out)' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to reset local storage?')) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            Reset Data
          </button>
        </div>
      </div>

      {/* Yes/No Password Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use your new password next time."
        confirmText="Yes, Change Password"
        cancelText="No, Keep Current"
        isDanger={false}
        onConfirm={handleConfirmPasswordChange}
        onCancel={() => setShowConfirmModal(false)}
      />
    </section>
  )
}

export default Settings
