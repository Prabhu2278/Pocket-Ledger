import React from 'react'

export function CustomDatePicker({ value, onChange, label }) {
  return (
    <div className="pocket-custom-datepicker">
      {label && <label className="pocket-field-label">{label}</label>}
      <input
        type="date"
        className="pocket-ledger-input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default CustomDatePicker
