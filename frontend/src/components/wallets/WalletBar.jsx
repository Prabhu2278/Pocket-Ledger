import React, { useState } from 'react'
import { WalletCard } from './components/WalletCard'
import { CreateWalletModal } from './components/CreateWalletModal'
import { EditWalletModal } from './components/EditWalletModal'
import { DeleteWalletModal } from './components/DeleteWalletModal'
import '../../styles/components/WalletBar.css'

export function WalletBar({
  wallets = [],
  selectedWallet = 'all',
  onSelectWallet = () => {},
  onAddWallet = () => {},
  onUpdateWallet = () => {},
  onDeleteWallet = () => {},
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  return (
    <div className="pocket-wallet-bar-container">
      <div className="pocket-wallet-bar-header">
        <h3 className="pocket-section-title">Accounts & Wallets</h3>
        <button
          type="button"
          className="pocket-wallet-add-btn"
          onClick={() => setCreateOpen(true)}
        >
          + Add Account
        </button>
      </div>

      <div className="pocket-wallet-carousel">
        <div
          className={`pocket-wallet-card ${selectedWallet === 'all' ? 'pocket-wallet-selected' : ''}`}
          onClick={() => onSelectWallet('all')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
        >
          <div className="pocket-wallet-header">
            <span className="pocket-wallet-name">All Accounts</span>
            <span className="pocket-wallet-type-badge">TOTAL</span>
          </div>
          <div className="pocket-wallet-balance">Overview</div>
        </div>

        {wallets.map((w) => (
          <WalletCard
            key={w.id}
            wallet={w}
            isSelected={selectedWallet === String(w.id)}
            onClick={() => onSelectWallet(String(w.id))}
            onEdit={(wallet) => setEditingWallet(wallet)}
            onDelete={(id) => setDeletingId(id)}
          />
        ))}
      </div>

      <CreateWalletModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={onAddWallet}
      />

      <EditWalletModal
        isOpen={Boolean(editingWallet)}
        wallet={editingWallet}
        onClose={() => setEditingWallet(null)}
        onSave={onUpdateWallet}
      />

      <DeleteWalletModal
        isOpen={Boolean(deletingId)}
        walletId={deletingId}
        walletName={wallets.find((w) => String(w.id) === String(deletingId))?.name}
        onClose={() => setDeletingId(null)}
        onConfirm={(id) => {
          onDeleteWallet(id)
          setDeletingId(null)
        }}
      />
    </div>
  )
}

export default WalletBar
