import React from 'react'

/**
 * AppLogo
 * Official Pocket Ledger brand icon (vibrant green squircle with clean white dollar symbol).
 */
export function AppLogo({ size = 28, className = '' }) {
  const radius = Math.round((28 / 100) * size)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pocket-ledger-app-logo ${className}`.trim()}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="Pocket Ledger logo"
    >
      <defs>
        <linearGradient id="pocket-brand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#05c985" />
          <stop offset="50%" stopColor="#00b87c" />
          <stop offset="100%" stopColor="#009e63" />
        </linearGradient>
      </defs>
      {/* Green Squircle Background */}
      <rect x="2" y="2" width="96" height="96" rx="28" fill="url(#pocket-brand-grad)" />
      {/* White Dollar Sign */}
      <path
        d="M50 18v64M63 34.5c-2-5-6.8-8.5-13-8.5-7.8 0-14 4.5-14 12 0 13.5 28 8.5 28 22 0 7.8-6.8 12-14 12-7.5 0-12.8-4.2-14.5-9.5"
        stroke="#ffffff"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AppLogo
