import React, { useEffect } from 'react'

export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  isDanger,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const actualVariant = isDanger !== undefined ? (isDanger ? 'danger' : 'primary') : variant

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')
    document.documentElement.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  const getIcon = () => {
    if (actualVariant === 'danger') {
      return (
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--pl-color-danger-soft, rgba(239, 68, 68, 0.15))',
            color: 'var(--pl-color-danger, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
      )
    }
    if (actualVariant === 'warning') {
      return (
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      )
    }
    return (
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'var(--pl-color-primary-soft, rgba(99, 102, 241, 0.15))',
          color: 'var(--pl-color-primary, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    )
  }

  const getConfirmStyle = () => {
    if (actualVariant === 'danger') {
      return {
        background: 'var(--pl-color-danger, #ef4444)',
        borderColor: 'var(--pl-color-danger, #ef4444)',
        color: '#ffffff',
      }
    }
    if (actualVariant === 'warning') {
      return {
        background: '#f59e0b',
        borderColor: '#f59e0b',
        color: '#ffffff',
      }
    }
    return {
      background: 'var(--pl-color-primary, #6366f1)',
      borderColor: 'var(--pl-color-primary, #6366f1)',
      color: '#ffffff',
    }
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel?.()
        }
      }}
      style={{ zIndex: 1200 }}
    >
      <div
        className="dialog-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{ maxWidth: '420px', padding: '24px' }}
      >
        {getIcon()}
        <h2
          id="confirm-dialog-title"
          style={{
            fontSize: '16px',
            fontWeight: 800,
            margin: '0 0 8px',
            color: 'var(--pl-text-primary)',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: '0 0 22px',
            fontSize: '13px',
            lineHeight: '1.5',
            color: 'var(--pl-text-muted)',
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="ghost"
            onClick={onCancel}
            disabled={isLoading}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 600 }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="primary"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              ...getConfirmStyle(),
            }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export const ConfirmDialog = ConfirmModal
export default ConfirmModal
