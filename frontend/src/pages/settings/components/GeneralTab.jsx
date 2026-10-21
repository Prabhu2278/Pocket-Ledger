import React from 'react'

export function GeneralTab({ theme = 'dark', onToggleTheme = () => {}, currency = 'INR', onCurrencyChange = () => {} }) {
  return (
    <div className="pocket-settings-section">
      <h3>Appearance</h3>
      <div className="pocket-settings-row">
        <div>
          <strong>Interface Theme</strong>
          <p className="pocket-settings-desc">Switch between Dark and Light mode</p>
        </div>
        <button
          type="button"
          className="pocket-ledger-btn-cancel"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </button>
      </div>

      <h3 style={{ marginTop: '24px' }}>Localization</h3>
      <div className="pocket-settings-row">
        <div>
          <strong>Primary Currency</strong>
          <p className="pocket-settings-desc">Currency used across balances and charts</p>
        </div>
        <select
          className="pocket-ledger-select"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          <option value="INR">₹ INR (Indian Rupee)</option>
          <option value="USD">$ USD (US Dollar)</option>
          <option value="EUR">€ EUR (Euro)</option>
          <option value="GBP">£ GBP (British Pound)</option>
        </select>
      </div>
    </div>
  )
}

export default GeneralTab
