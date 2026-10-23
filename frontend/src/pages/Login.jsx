import React, { useState, useEffect } from 'react'
import { authApi } from '../services/authApi'

export function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Strictly lock viewport to prevent any page scrolling while in authentication view
  useEffect(() => {
    document.documentElement.classList.add('auth-locked')
    document.body.classList.add('auth-locked')
    return () => {
      document.documentElement.classList.remove('auth-locked')
      document.body.classList.remove('auth-locked')
    }
  }, [])

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
    <div className="auth-split-wrapper">
      {/* Left Information Panel */}
      <div className="auth-split-left">
        {/* Animated ambient lighting orbs & grid */}
        <div className="auth-ambient-orb orb-left-1" aria-hidden="true" />
        <div className="auth-ambient-orb orb-left-2" aria-hidden="true" />
        <div className="auth-ambient-orb orb-left-3" aria-hidden="true" />
        <div className="auth-grid-overlay" aria-hidden="true" />

        <div className="auth-left-inner">
          <div className="auth-brand-badge">
            <div className="auth-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
                <path d="M9 8h6M9 12h6" />
              </svg>
            </div>
            <span className="auth-brand-name">Pocket Ledger</span>
            <span className="auth-brand-pill">Pro v2.4</span>
          </div>

          <div className="auth-pitch-content">
            <h1>Master Your Wealth with Intelligent Simplicity</h1>
            <p className="pitch-desc">
              A modern, high-precision finance dashboard. Manage multi-wallet balances, monitor real-time cash flows, import bank statements, and customize your financial workspace.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item feature-wallet">
                <div className="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="auth-feature-text">
                  <h4>Multi-Wallet Ecosystem</h4>
                  <p>Organize Cash, Bank Accounts, UPI, and Cards with instant transfers.</p>
                </div>
              </div>

              <div className="auth-feature-item feature-analytics">
                <div className="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="auth-feature-text">
                  <h4>Real-Time Financial Intelligence</h4>
                  <p>Visual income vs. expense analytics, category breakdowns, and monthly budget meters.</p>
                </div>
              </div>

              <div className="auth-feature-item feature-parser">
                <div className="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div className="auth-feature-text">
                  <h4>Smart Bank Parser & 10 Themes</h4>
                  <p>Instant statement CSV import with 5 light and 5 dark handcrafted palettes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <span>&copy; {new Date().getFullYear()} Pocket Ledger. All rights reserved.</span>
            <div className="auth-security-badge">
              <span className="auth-radar-dot" aria-hidden="true"></span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Bank-Grade 256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="auth-split-right">
        {/* Ambient aura glow behind the card */}
        <div className="auth-card-backdrop-glow" aria-hidden="true" />
        <div className="auth-ambient-orb orb-right-1" aria-hidden="true" />

        <div className="auth-form-card">
          <div className="auth-card-glow-bar" aria-hidden="true" />

          <div className="auth-form-header">
            <div className="auth-form-badge">
              <span className="auth-badge-dot"></span>
              Welcome Back
            </div>
            <h2>Sign in to Pocket Ledger</h2>
            <p>Enter your credentials to access your financial dashboard.</p>
          </div>

          {error && (
            <div className="auth-alert-box" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="f" noValidate>
            <label>
              <span>Email address</span>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="auth-has-icon"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-has-icon auth-has-toggle"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button
              className="primary auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              <span className="auth-btn-sheen" aria-hidden="true" />
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin-icon">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="auth-btn-arrow">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>{' '}
            <a
              href="#/register"
              className="auth-link-highlight"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateToRegister) onNavigateToRegister()
                else window.location.hash = '#/register'
              }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
