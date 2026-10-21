import React from 'react'

export function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errors,
  setErrors,
  submitting,
  onSubmit,
}) {
  return (
    <form className="pocket-ledger-auth-form" onSubmit={onSubmit} noValidate autoComplete="off">
      <div className="pocket-ledger-auth-field-group">
        <label htmlFor="login-username">Username</label>
        <div className="pocket-ledger-input-with-icon">
          <span className="pocket-ledger-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input
            id="login-username"
            name="pocket_login_username"
            type="text"
            className={`pocket-ledger-auth-field ${errors.username ? 'has-error' : ''}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username || errors.general) {
                setErrors((prev) => ({ ...prev, username: '', general: '' }))
              }
            }}
            placeholder="Username"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            required
          />
        </div>
        {errors.username && (
          <span className="pocket-ledger-field-error" role="alert">
            {errors.username}
          </span>
        )}
      </div>

      <div className="pocket-ledger-auth-field-group">
        <label htmlFor="login-password">Password</label>
        <div className="pocket-ledger-input-with-icon">
          <span className="pocket-ledger-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">