import React, { useState, useEffect, useRef } from 'react'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function MonthPickerPopover({
  isOpen,
  onClose,
  currentYear,
  currentMonth,
  onSelectMonth,
}) {
  const popoverRef = useRef(null)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  useEffect(() => {
    if (isOpen) {
      setSelectedYear(currentYear)
    }
  }, [isOpen, currentYear])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose()
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const now = new Date()
  const actualYear = now.getFullYear()
  const actualMonth = now.getMonth()

  const handlePickMonth = (monthIndex) => {
    onSelectMonth({ year: selectedYear, month: monthIndex })
    onClose()
  }

  const handleSelectCurrent = () => {
    onSelectMonth({ year: actualYear, month: actualMonth })
    onClose()
  }

  return (
    <div
      ref={popoverRef}
      className="month-picker-popover"
      role="dialog"
      aria-label="Select month and year"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 9999,
        width: '280px',
        padding: '16px',
        borderRadius: '16px',
        background: 'var(--pl-bg-surface, #ffffff)',
        border: '1px solid var(--pl-border-default, #e2e8f0)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(16px)',
        userSelect: 'none',
      }}
    >
      {/* Year Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--pl-border-default, #e2e8f0)',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedYear((y) => y - 1)}
          className="header-month-btn"
          style={{ width: '32px', height: '32px', fontSize: '18px' }}
          aria-label="Previous year"
          title="Previous year"
        >
          ‹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--pl-text-primary, #0f172a)',
              letterSpacing: '-0.3px',
            }}
          >
            {selectedYear}
          </span>
          {selectedYear !== actualYear && (
            <button
              type="button"
              onClick={() => setSelectedYear(actualYear)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid var(--pl-color-primary, #4f46e5)',
                background: 'var(--pl-color-primary-soft, #eef2ff)',
                color: 'var(--pl-color-primary, #4f46e5)',
                cursor: 'pointer',
              }}
              title="Jump to current year"
            >
              This Year
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedYear((y) => y + 1)}
          className="header-month-btn"
          style={{ width: '32px', height: '32px', fontSize: '18px' }}
          aria-label="Next year"
          title="Next year"
        >
          ›
        </button>
      </div>

      {/* 12 Months Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        {MONTH_NAMES.map((name, idx) => {
          const isSelected = selectedYear === currentYear && idx === currentMonth
          const isActualCurrent = selectedYear === actualYear && idx === actualMonth

          return (
            <button
              key={name}
              type="button"
              onClick={() => handlePickMonth(idx)}
              style={{
                padding: '9px 4px',
                borderRadius: '10px',
                border: isSelected
                  ? '1px solid #4f46e5'
                  : '1px solid transparent',
                background: isSelected
                  ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                  : 'var(--pl-bg-surface-hover, rgba(0,0,0,0.03))',
                color: isSelected
                  ? '#ffffff'
                  : isActualCurrent
                  ? 'var(--pl-color-primary, #4f46e5)'
                  : 'var(--pl-text-primary, #0f172a)',
                fontWeight: isSelected ? 800 : isActualCurrent ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              className="month-picker-cell"
            >
              {name}
              {isActualCurrent && !isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--pl-color-primary, #4f46e5)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleSelectCurrent}
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--pl-color-primary-soft, #eef2ff)',
            color: 'var(--pl-color-primary, #4f46e5)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Jump to Current Month
        </button>
      </div>
    </div>
  )
}
