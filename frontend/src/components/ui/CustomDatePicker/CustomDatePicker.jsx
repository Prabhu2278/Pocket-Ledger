import React, { useState, useRef, useEffect, useMemo } from 'react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/**
 * CustomDatePicker - Calendar popup matching the exact visual design of Image 2
 * Features:
 * - Header: 'Month, Year ▾' with Up (↑) and Down (↓) month navigation arrows
 * - Days: 'Su Mo Tu We Th Fr Sa'
 * - Day cells with muted grey overflow dates and charcoal-highlighted selected date
 * - Footer: 'Clear' (blue link on left) and 'Today' (blue link on right)
 */
export function CustomDatePicker({
  id,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  style = {},
  inputStyle = {},
  className = '',
  required = false,
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Parse current selected date or fallback to today
  const selectedDateObj = useMemo(() => {
    if (!value) return null
    const parts = String(value).split('-')
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10) - 1
      const d = parseInt(parts[2], 10)
      const date = new Date(y, m, d)
      if (!isNaN(date.getTime())) return date
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }, [value])

  // Current view month & year state
  const [viewYear, setViewYear] = useState(() => {
    return selectedDateObj ? selectedDateObj.getFullYear() : new Date().getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    return selectedDateObj ? selectedDateObj.getMonth() : new Date().getMonth()
  })

  // Sync view when value changes from outside
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear())
      setViewMonth(selectedDateObj.getMonth())
    }
  }, [selectedDateObj])

  // Dynamic placement: user requested to show upside of the date box and within the form
  const [placement, setPlacement] = useState({
    vertical: 'top',
    horizontal: 'left',
  })

  // Measure space and ensure popover opens upside and stays inside the form/window
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceRight = window.innerWidth - rect.left

      // Prefer upside ('top') as requested; only flip if space above is critically constrained (< 170px) and bottom has significantly more room
      const vertical = (spaceAbove >= 170 || spaceAbove >= spaceBelow) ? 'top' : 'bottom'

      // Horizontal: If less than 255px to right edge or near right border, align right: 0 to stay inside the container/form
      const horizontal = (spaceRight < 255 || (window.innerWidth - rect.right < 20)) ? 'right' : 'left'

      setPlacement({ vertical, horizontal })
    }
  }, [open])

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Month navigation:
  // In Image 2, Up arrow (↑) navigates backwards/forwards and Down arrow (↓) navigates
  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
  }

  // Quick action: Today
  const handleSelectToday = (e) => {
    e.stopPropagation()
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    onChange && onChange(dateStr)
    setOpen(false)
  }

  // Quick action: Clear
  const handleClear = (e) => {
    e.stopPropagation()
    onChange && onChange('')
    setOpen(false)
  }

  // Compute 35-42 calendar days for viewMonth and viewYear
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days = []

    // 1. Trailing days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      days.push({
        day: dayNum,
        dateStr,
        isCurrentMonth: false,
      })
    }

    // 2. Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
      })
    }

    // 3. Leading days of next month (complete up to 35 or 42 cells)
    const totalCells = days.length <= 35 ? 35 : 42
    const remaining = totalCells - days.length
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewYear, viewMonth])

  const formattedDisplay = value ? String(value) : ''

  return (
    <div
      ref={containerRef}
      className={`custom-datepicker-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Trigger Button Input */}
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setOpen(!open)
          }
        }}
        className="custom-datepicker-trigger"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          minHeight: '38px',
          borderRadius: 'var(--pl-radius-md, 8px)',
          border: open
            ? '1.5px solid var(--pl-color-primary, #6366f1)'
            : '1px solid var(--pl-border-default, #2a3449)',
          background: 'var(--pl-bg-surface, #1e293b)',
          color: formattedDisplay
            ? 'var(--pl-text-primary, #f1f5f9)'
            : 'var(--pl-text-muted, #94a3b8)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          boxShadow: open ? '0 0 0 3px rgba(99, 102, 241, 0.18)' : 'none',
          userSelect: 'none',
          ...inputStyle,
        }}
      >
        <span>{formattedDisplay || placeholder}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--pl-text-muted, #94a3b8)', flexShrink: 0 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {/* Calendar Popover Popup - Positioned upside and made compact/smaller to fit within form */}
      {open && (
        <div
          role="dialog"
          aria-label="Calendar picker"
          className="custom-calendar-popover"
          style={{
            position: 'absolute',
            ...(placement.vertical === 'top'
              ? { bottom: 'calc(100% + 6px)', top: 'auto' }
              : { top: 'calc(100% + 6px)', bottom: 'auto' }),
            ...(placement.horizontal === 'right'
              ? { right: 0, left: 'auto' }
              : { left: 0, right: 'auto' }),
            zIndex: 1300,
            width: '246px',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 10px 8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.16), 0 4px 10px rgba(0, 0, 0, 0.06)',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        >
          {/* Calendar Header: 'Month, Year ▾' on left; '↑' and '↓' arrows on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '0 2px',
            }}
          >
            {/* Month & Year Title with Caret */}
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#0f172a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                userSelect: 'none',
              }}
            >
              <span>{MONTH_NAMES[viewMonth]}, {viewYear}</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginLeft: '1px' }}
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>

            {/* Navigation Arrows: Up (↑) & Down (↓) side by side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Up arrow button */}
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                title="Previous Month"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>

              {/* Down arrow button */}
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                title="Next Month"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of Week Header: Su Mo Tu We Th Fr Sa */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              marginBottom: '4px',
              userSelect: 'none',
            }}
          >
            {WEEK_DAYS.map((w) => (
              <div
                key={w}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1e293b',
                  padding: '2px 0',
                }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Grid: 7 columns of Day cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px 1px',
              textAlign: 'center',
            }}
          >
            {calendarDays.map((item, idx) => {
              const isSelected = value && item.dateStr === value

              return (
                <div
                  key={`${item.dateStr}-${idx}`}
                  onClick={() => {
                    onChange && onChange(item.dateStr)
                    setOpen(false)
                  }}
                  style={{
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      width: '23px',
                      height: '23px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : item.isCurrentMonth ? 500 : 400,
                      borderRadius: '3px',
                      // Selected day has charcoal filled box matching Image 2
                      background: isSelected ? '#52525b' : 'transparent',
                      color: isSelected
                        ? '#ffffff'
                        : item.isCurrentMonth
                        ? '#0f172a'
                        : '#94a3b8',
                      border: isSelected ? '1.2px solid #27272a' : 'none',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f1f5f9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {item.day}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Footer: 'Clear' on left, 'Today' on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
              userSelect: 'none',
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSelectToday}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomDatePicker
