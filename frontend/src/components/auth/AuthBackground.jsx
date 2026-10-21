import React from 'react'
import { AppLogo } from '@/components/ui/AppLogo/AppLogo'

export function AuthBackground({ theme = 'dark', setTheme }) {
  return (
    <>
      {/* Dynamic Immersive Background Layer for Light & Dark Theme */}
      <div className="pocket-ledger-auth-bg-layer" aria-hidden="true">
        <div className="pocket-ledger-auth-bg-grid" />
        
        {/* Soft Ambient Nebula Orbs */}
        <div className="pocket-ledger-auth-bg-orb bg-orb-emerald" />
        <div className="pocket-ledger-auth-bg-orb bg-orb-violet" />
        <div className="pocket-ledger-auth-bg-orb bg-orb-cyan" />
        <div className="pocket-ledger-auth-bg-orb bg-orb-amber" />

        {/* Floating Decorative Fintech & Geometric Shapes */}
        <div className="pocket-ledger-auth-floating-shape shape-coin-1">
          <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M15 8.5H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H8" />
          </svg>
        </div>

        <div className="pocket-ledger-auth-floating-shape shape-coin-2">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9h6v6" />
          </svg>
        </div>

        <div className="pocket-ledger-auth-floating-shape shape-trend">
          <svg width="130" height="52" viewBox="0 0 130 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 44 C 28 42, 48 30, 72 32 C 94 34, 104 14, 126 8" strokeDasharray="4 4" />
            <circle cx="126" cy="8" r="3.5" fill="currentColor" />
          </svg>
        </div>

        <div className="pocket-ledger-auth-floating-shape shape-star-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        <div className="pocket-ledger-auth-floating-shape shape-star-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        <div className="pocket-ledger-auth-floating-shape shape-ring-1" />
        <div className="pocket-ledger-auth-floating-shape shape-ring-2" />
      </div>

      {/* Top Floating Controls */}
      <div className="pocket-ledger-auth-top-bar">
        <div className="pocket-ledger-auth-mobile-logo">
          <AppLogo size={26} />
          <span className="pocket-ledger-auth-mobile-title">Pocket Ledger</span>
        </div>

        {setTheme && (
          <button
            className="pocket-ledger-topbar-theme-btn"
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </>
  )
}

export default AuthBackground
