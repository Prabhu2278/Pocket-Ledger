import React from 'react'

export function RegisterForm({
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
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
        <label htmlFor="reg-username">Choose a Username</label>
        <div className="pocket-ledger-input-with-icon">
          <span className="pocket-ledger-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input
            id="reg-username"
            name="pocket_reg_username"
            type="text"
            className={`pocket-ledger-auth-field ${errors.username ? 'has-error' : ''}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username) {
                setErrors((prev) => ({ ...prev, username: '' }))
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
        <label htmlFor="reg-password">Create Password</label>
        <div className="pocket-ledger-input-with-icon">
          <span className="pocket-ledger-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            id="reg-password"
            name="pocket_reg_password"
            type={showPassword ? 'text' : 'password'}
            className={`pocket-ledger-auth-field ${errors.password ? 'has-error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: '' }))
              }
            }}
            placeholder="Password"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            required
          />
          <button
            type="button"
            className="pocket-ledger-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <span className="pocket-ledger-field-error" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <div className="pocket-ledger-auth-field-group">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <div className="pocket-ledger-input-with-icon">
          <span className="pocket-ledger-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <input
            id="reg-confirm"
            name="pocket_reg_confirm"
            type={showPassword ? 'text' : 'password'}
            className={`pocket-ledger-auth-field ${errors.confirmPassword ? 'has-error' : ''}`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }
            }}
            placeholder="Repeat your password"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            required
          />
        </div>
        {errors.confirmPassword && (
          <span className="pocket-ledger-field-error" role="alert">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="pocket-ledger-auth-submit-btn"
        disabled={submitting}
      >
        {submitting ? (
          <span className="pocket-ledger-btn-loader">Creating Account...</span>
        ) : (
          <>
            <span>Create Free Account</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
