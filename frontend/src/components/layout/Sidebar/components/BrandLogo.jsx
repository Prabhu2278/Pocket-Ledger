import React from 'react'
import { AppLogo } from '@/components/ui/AppLogo/AppLogo'

/**
 * BrandLogo
 * Action: Renders the Pocket Ledger application brand header with modern styling,
 * animated gradient logo aura, and dual-tone fintech typography.
 */
export function BrandLogo() {
  return (
    <div className="pocket-ledger-brand">
      <div className="pocket-ledger-brand-icon-wrap">
        <AppLogo size={32} />
        <span className="pocket-ledger-brand-icon-glow" aria-hidden="true" />
      </div>
      <div className="pocket-ledger-brand-text-col">
        <div className="pocket-ledger-brand-title">
          <span className="brand-word-pocket">Pocket</span>
          <span className="brand-word-ledger">Ledger</span>
        </div>
        <span className="pocket-ledger-brand-edition">PREMIUM TREASURY</span>
      </div>
    </div>
  )
}

export default BrandLogo
