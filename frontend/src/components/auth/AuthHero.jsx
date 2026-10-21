import React from 'react'
import { AppLogo } from '@/components/ui/AppLogo/AppLogo'

export function AuthHero() {
  return (
    <div className="pocket-ledger-auth-left-hero">
      <div className="pocket-ledger-auth-ambient-orb orb-1" aria-hidden="true" />
      <div className="pocket-ledger-auth-ambient-orb orb-2" aria-hidden="true" />
      <div className="pocket-ledger-auth-ambient-orb orb-3" aria-hidden="true" />

      <div className="pocket-ledger-auth-left-content">
        {/* Brand Header */}
        <div className="pocket-ledger-auth-brand-badge">
          <AppLogo size={36} />
          <div className="pocket-ledger-auth-brand-text">
            <span className="pocket-ledger-brand-name">Pocket Ledger</span>
            <span className="pocket-ledger-brand-tag">Intelligent Wealth & Expense Tracker</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="pocket-ledger-auth-hero-copy">
          <h1 className="pocket-ledger-hero-headline">
            Master your personal money with <span className="highlight-text">crystal clarity</span>.
          </h1>
          <p className="pocket-ledger-hero-sub">
            Take control of your finances across Bank, UPI, and Cash accounts. Enjoy month-by-month isolated budgeting, automated statement CSV import, and live cash flow analytics.
          </p>
        </div>

        {/* Visual Mini Dashboard Preview Card */}
        <div className="pocket-ledger-preview-card">
          <div className="pocket-ledger-preview-header">
            <span className="pocket-ledger-preview-title">Monthly Overview • October 2026</span>
            <span className="pocket-ledger-preview-pill">Active</span>
          </div>
          <div className="pocket-ledger-preview-kpi-row">
            <div className="pocket-ledger-preview-stat">
              <small>Target Budget</small>
              <strong className="stat-budget">₹1,00,000</strong>
            </div>
            <div className="pocket-ledger-preview-stat">
              <small>Net Cash Flow</small>
              <strong className="stat-savings">+₹48,250</strong>
            </div>
            <div className="pocket-ledger-preview-stat">
              <small>Budget Health</small>
              <strong className="stat-health">72% Left</strong>
            </div>
          </div>
        </div>

        {/* Rich Feature Highlights with Color-Coded Badges */}
        <div className="pocket-ledger-auth-features-list">
          <div className="pocket-ledger-feature-item">
            <div className="pocket-ledger-feature-icon icon-emerald" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="pocket-ledger-feature-text">
              <h4>Multi-Wallet Tracking</h4>
              <p>Organize Bank, UPI, and Cash accounts with live automatic balances.</p>
            </div>
          </div>

          <div className="pocket-ledger-feature-item">
            <div className="pocket-ledger-feature-icon icon-violet" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m10 15 5-3-5-3v6Z" />
              </svg>
            </div>
            <div className="pocket-ledger-feature-text">
              <h4>Month-Specific Budgets</h4>
              <p>Starts with ₹1,00,000 default. Changing one month never affects another.</p>
            </div>
          </div>

          <div className="pocket-ledger-feature-item">
            <div className="pocket-ledger-feature-icon icon-blue" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="pocket-ledger-feature-text">
              <h4>Bank CSV Import & Export</h4>
              <p>Auto-categorize transactions from CSV statements & export isolated monthly reports.</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="pocket-ledger-auth-left-footer">
          <span className="pocket-ledger-trust-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Private & Secure Local Storage</span>
          </span>
          <span className="pocket-ledger-trust-dot">•</span>
          <span className="pocket-ledger-trust-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Fast Offline-First Engine</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default AuthHero
