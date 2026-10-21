import React, { useState, useRef, useEffect } from 'react'

export function CustomDropdown({ value, options = [], onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => (o.value ?? o) === value)
  const displayLabel = selectedOption ? (selectedOption.label ?? selectedOption) : placeholder

  return (
    <div className="pocket-custom-dropdown" ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="pocket-ledger-select"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span>{displayLabel}</span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--pocket-card)',
            border: '1px solid var(--pocket-line)',
            borderRadius: '10px',
            listStyle: 'none',
            padding: '6px',
            margin: 0,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          {options.map((opt, idx) => {
            const val = opt.value ?? opt
            const lbl = opt.label ?? opt
            return (
              <li
                key={idx}
                onClick={() => {
                  onChange(val)
                  setOpen(false)
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  background: val === value ? 'var(--pocket-accent-glow)' : 'transparent',
                  color: val === value ? 'var(--pocket-accent)' : 'inherit',
                }}
              >
                {lbl}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default CustomDropdown
