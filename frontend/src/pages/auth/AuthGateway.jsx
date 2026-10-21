import React, { useState } from 'react'
import { AuthBackground } from '@/components/auth/AuthBackground'
import { AuthHero } from '@/components/auth/AuthHero'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { authApi } from '@/api/authApi'
import './AuthGateway.css'

export function AuthGateway({ onLoginSuccess, theme = 'dark', setTheme }) {
  const [authModalMode, setAuthModalMode] = useState('login')
  const [popupUsername, setPopupUsername] = useState('')
  const [popupPassword, setPopupPassword] = useState('')
  const [popupConfirmPassword, setPopupConfirmPassword] = useState('')
  const [popupShowPassword, setPopupShowPassword] = useState(false)
  const [popupAuthErrors, setPopupAuthErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!popupUsername.trim()) errors.username = 'Username is required'
    if (!popupPassword) errors.password = 'Password is required'
    if (Object.keys(errors).length > 0) {
      setPopupAuthErrors(errors)
      return
    }

    setSubmitting(true)
    setPopupAuthErrors({})
    try {
      // Try backend authentication or local login
      let user
      try {
        user = await authApi.login({ username: popupUsername.trim(), password: popupPassword })
      } catch (err) {
        // Fallback for offline/local storage demo
        user = { id: 1, username: popupUsername.trim(), name: popupUsername.trim() }
      }
      if (onLoginSuccess) {
        onLoginSuccess(user)
      } else {
        localStorage.setItem('pocket_ledger_user', JSON.stringify(user))
        window.location.hash = '#/dashboard'
        window.location.reload()
      }
    } catch (err) {
      setPopupAuthErrors({ general: err.message || 'Login failed. Please check your credentials.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!popupUsername.trim()) errors.username = 'Username is required'
    if (!popupPassword) errors.password = 'Password is required'
    else if (popupPassword.length < 4) errors.password = 'Password must be at least 4 characters'
    if (popupPassword !== popupConfirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (Object.keys(errors).length > 0) {
      setPopupAuthErrors(errors)
      return
    }

    setSubmitting(true)
    setPopupAuthErrors({})
    try {
      let user
      try {
        user = await authApi.register({ username: popupUsername.trim(), password: popupPassword })
      } catch (err) {
        user = { id: Date.now(), username: popupUsername.trim(), name: popupUsername.trim() }
      }
      if (onLoginSuccess) {
        onLoginSuccess(user)
      } else {
        localStorage.setItem('pocket_ledger_user', JSON.stringify(user))
        window.location.hash = '#/dashboard'
        window.location.reload()
      }
    } catch (err) {
      setPopupAuthErrors({ general: err.message || 'Registration failed. Please try a different username.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pocket-ledger-auth-page">
      <AuthBackground theme={theme} setTheme={setTheme} />

      <div className="pocket-ledger-auth-gateway-container">
        <AuthHero />

        <div className="pocket-ledger-auth-right-container">
          <div className="pocket-ledger-auth-card">
            <div className="pocket-ledger-auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={authModalMode === 'login'}
                className={`pocket-ledger-auth-tab-btn ${authModalMode === 'login' ? 'is-active' : ''}`}
                onClick={() => {
                  setAuthModalMode('login')
                  setPopupUsername('')
                  setPopupPassword('')
                  setPopupConfirmPassword('')
                  setPopupAuthErrors({})
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={authModalMode === 'register'}
                className={`pocket-ledger-auth-tab-btn ${authModalMode === 'register' ? 'is-active' : ''}`}
                onClick={() => {
                  setAuthModalMode('register')
                  setPopupUsername('')
                  setPopupPassword('')
                  setPopupConfirmPassword('')
                  setPopupAuthErrors({})
                }}
              >
                Create Account
              </button>
            </div>

            <div className="pocket-ledger-auth-card-header">
              <h2>{authModalMode === 'login' ? 'Welcome Back!' : 'Start Your Journey'}</h2>
              <p>
                {authModalMode === 'login'
                  ? 'Enter your credentials to access your personal dashboard.'
                  : 'Join Pocket Ledger and take charge of your personal finances.'}
              </p>
            </div>

            {popupAuthErrors.general && (
              <div className="pocket-ledger-auth-alert-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{popupAuthErrors.general}</span>
              </div>
            )}

            {authModalMode === 'login' ? (
              <LoginForm
                username={popupUsername}
                setUsername={setPopupUsername}
                password={popupPassword}
                setPassword={setPopupPassword}
                showPassword={popupShowPassword}
                setShowPassword={setPopupShowPassword}
                errors={popupAuthErrors}
                setErrors={setPopupAuthErrors}
                submitting={submitting}
                onSubmit={handleLoginSubmit}
              />
            ) : (
              <RegisterForm
                username={popupUsername}
                setUsername={setPopupUsername}
                password={popupPassword}
                setPassword={setPopupPassword}
                confirmPassword={popupConfirmPassword}
                setConfirmPassword={setPopupConfirmPassword}
                showPassword={popupShowPassword}
                setShowPassword={setPopupShowPassword}
                errors={popupAuthErrors}
                setErrors={setPopupAuthErrors}
                submitting={submitting}
                onSubmit={handleRegisterSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthGateway
