import React from 'react'
import { WalletBar } from '../../components/wallets/WalletBar'
import './WalletsPage.css'

export function WalletsPage({
  wallets = [],
  selectedWallet = 'all',
  onSelectWallet = () => {},
  onAddWallet = () => {},
  onUpdateWallet = () => {},
  onDeleteWallet = () => {},
}) {
  return (
    <section className="pocket-wallets-page" aria-label="Wallets and Accounts">
      <WalletBar
        wallets={wallets}
        selectedWallet={selectedWallet}
        onSelectWallet={onSelectWallet}
        onAddWallet={onAddWallet}
        onUpdateWallet={onUpdateWallet}
        onDeleteWallet={onDeleteWallet}
      />
    </section>
  )
}

export default WalletsPage
