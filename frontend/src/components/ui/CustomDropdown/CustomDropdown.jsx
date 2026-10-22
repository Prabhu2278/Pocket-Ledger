import React, { useState, useRef, useEffect, useMemo } from 'react'

/**
 * CustomDropdown - High-fidelity custom dropdown matching design specification
 * Provides styled option list with active/hover slate-grey highlight (#5a6472)
 */
export function CustomDropdown({
  id,
  value,
  options = [],
  onChange,
  placeholder = '- Select -',
  disabled = false,
  style = {},
  triggerStyle = {},
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  // Normalize options to { value, label } format
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (opt && typeof opt === 'object') {
        return {
          value: opt.value ?? opt.id ?? '',
          label: opt.label ?? opt.name ?? String(opt.value ?? ''),
          sublabel: opt.sublabel ?? '',
          disabled: !!opt.disabled,
        }
      }
      return {
        value: opt,
        label: String(opt),
        sublabel: '',
        disabled: false,
      }
    })
  }, [options])

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (o) => String(o.value) === String(value)
  )

  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Close when clicking outside
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

  // Scroll active option into view when opened
  useEffect(() => {
    if (open && listRef.current) {
      const selectedIndex = normalizedOptions.findIndex(
        (o) => String(o.value) === String(value)
      )
      if (selectedIndex >= 0) {
        setHighlightedIndex(selectedIndex)
        const itemEl = listRef.current.children[selectedIndex]
        if (itemEl && typeof itemEl.scrollIntoView === 'function') {
          itemEl.scrollIntoView({ block: 'nearest' })
        }
      }
    }
  }, [open, value, normalizedOptions])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open && highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        const target = normalizedOptions[highlightedIndex]
        if (!target.disabled) {
          onChange && onChange(target.value)
          setOpen(false)
        }
      } else {
        setOpen(!open)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        )
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`custom-dropdown-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="custom-dropdown-trigger"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          minHeight: '38px',
          borderRadius: 'var(--pl-radius-md, 8px)',
          border: open
            ? '1.5px solid var(--pl-color-primary, #6366f1)'
            : '1px solid var(--pl-border-default, #2a3449)',
          background: 'var(--pl-bg-surface, #1e293b)',
          color: selectedOption
            ? 'var(--pl-text-primary, #f1f5f9)'
            : 'var(--pl-text-muted, #94a3b8)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          boxShadow: open ? '0 0 0 3px rgba(99, 102, 241, 0.18)' : 'none',
          ...triggerStyle,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {displayLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--pl-text-muted, #94a3b8)',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Popover List */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="custom-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'var(--pl-bg-surface, #1e293b)',
            border: '1px solid var(--pl-border-default, #2a3449)',
            borderRadius: '8px',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            zIndex: 1200,
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.45), 0 8px 12px -6px rgba(0, 0, 0, 0.3)',
            boxSizing: 'border-box',
          }}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value)
            const isHighlighted = idx === highlightedIndex

            return (
              <li
                key={idx}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange && onChange(opt.value)
                    setOpen(false)
                  }
                }}
                className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '9px 14px',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  fontSize: '13.5px',
                  fontWeight: isSelected ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  // Highlight with slate-grey background matching user specification Image 1
                  background: isSelected || isHighlighted
                    ? '#5a6472'
                    : 'transparent',
                  color: isSelected || isHighlighted
                    ? '#ffffff'
                    : 'var(--pl-text-primary, #f1f5f9)',
                  opacity: opt.disabled ? 0.45 : 1,
                  transition: 'background 0.12s ease, color 0.12s ease',
                  userSelect: 'none',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {opt.label}
                </span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default CustomDropdown
