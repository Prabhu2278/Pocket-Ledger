import React, { useState } from 'react'
import { authApi } from '../services/authApi'

export function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      onRegisterSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pl-color-primary)" strokeWidth="2.5">
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>Pocket Ledger</span>
        </div>

        <h1>Create account</h1>
        <p className="subtitle">Start tracking your income, expenses, and monthly budget.</p>

        <form onSubmit={handleSubmit} className="f" noValidate>
          <label>
            Full name
            <input
              type="text"
              placeholder="e.g. Prabhu Deva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', minHeight: '44px' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a
            href="#/login"
            onClick={(e) => {
              e.preventDefault()
              if (onNavigateToLogin) onNavigateToLogin()
              else window.location.hash = '#/login'
            }}
          >
            Sign in
          </a>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px' }}>
          <a href="#/expenses" style={{ color: 'var(--pl-text-muted)', textDecoration: 'none' }}>
            ← Continue as guest
          </a>
        </div>
      </div>
    </div>
  )
}

export default Register
