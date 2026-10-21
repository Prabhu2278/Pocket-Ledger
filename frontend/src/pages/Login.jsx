import React, { useState } from 'react'
import { authApi } from '../services/authApi'

export function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await authApi.login({ email: email.trim(), password })
      onLoginSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5">
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>Pocket Ledger</span>
        </div>

        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to access your personal ledger and financial insights.</p>

        <form onSubmit={handleSubmit} className="f" noValidate>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a
            href="#/register"
            onClick={(e) => {
              e.preventDefault()
              if (onNavigateToRegister) onNavigateToRegister()
              else window.location.hash = '#/register'
            }}
          >
            Create account
          </a>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px' }}>
          <a href="#/expenses" style={{ color: 'var(--mute)', textDecoration: 'none' }}>
            ← Continue as guest
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
