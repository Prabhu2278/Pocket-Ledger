import React, { useState } from 'react'
import { authApi } from '@/services/authApi'

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pocket-settings-section">
      <h3>Security & Authentication</h3>
      <p className="pocket-settings-desc">Update your password to keep your account secure.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '440px', marginTop: '16px' }}>
        {error && (
          <div style={{ color: 'var(--pocket-negative, #ff7a8a)', marginBottom: '12px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: 'var(--pocket-positive, #4ade80)', marginBottom: '12px', fontSize: '13px' }}>
            {success}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
            Current Password
          </label>
          <input
            type="password"
            className="pocket-ledger-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
            New Password
          </label>
          <input
            type="password"
            className="pocket-ledger-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
            Confirm New Password
          </label>
          <input
            type="password"
            className="pocket-ledger-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="submit"
            className="pocket-ledger-btn-primary"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SecurityTab
