import { useState, useMemo, useCallback } from 'react'
import { INITIAL_WALLETS } from '../../utils/initialData'

export function useWalletsSlice(currentUser, transactions = [], monthTransactions = [], setData = null, showToast = null) {
  const [wallets, setWallets] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pocket_ledger_wallets')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {}
      }
    }
    return INITIAL_WALLETS
  })

  const [selectedWallet, setSelectedWallet] = useState('all')
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deleteWalletId, setDeleteWalletId] = useState(null)

  // Compute live wallet balances
  const computedWallets = useMemo(() => {
    return wallets.map((w) => {
      let balance = Number(w.initial_balance) || 0
      transactions.forEach((tx) => {
        const amt = Number(tx.amt || tx.amount) || 0
        const type = (tx.type || 'EXPENSE').toUpperCase()
        if (tx.wallet_id === w.id) {
          if (type === 'INCOME') balance += amt
          else if (type === 'EXPENSE') balance -= amt
          else if (type === 'TRANSFER') balance -= amt
        }
        if (type === 'TRANSFER' && tx.to_wallet_id === w.id) {
          balance += amt
        }
      })
      return { ...w, balance }
    })
  }, [wallets, transactions])

  const addWallet = useCallback((newWallet) => {
    setWallets((prev) => {
      const updated = [...prev, { ...newWallet, id: Date.now() }]
      localStorage.setItem('pocket_ledger_wallets', JSON.stringify(updated))
      return updated
    })
    if (showToast) showToast('Account created successfully')
  }, [showToast])

  const updateWallet = useCallback((id, updatedData) => {
    setWallets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, ...updatedData } : w))
      localStorage.setItem('pocket_ledger_wallets', JSON.stringify(updated))
      return updated
    })
    if (showToast) showToast('Account updated')
  }, [showToast])

  const deleteWallet = useCallback((id) => {
    setWallets((prev) => {
      const updated = prev.filter((w) => w.id !== id)
      localStorage.setItem('pocket_ledger_wallets', JSON.stringify(updated))
      return updated
    })
    if (showToast) showToast('Account deleted')
  }, [showToast])

  return {
    wallets,
    setWallets,
    computedWallets,
    selectedWallet,
    setSelectedWallet,
    walletModalOpen,
    setWalletModalOpen,
    editingWallet,
    setEditingWallet,
    deleteWalletId,
    setDeleteWalletId,
    addWallet,
    updateWallet,
    deleteWallet,
  }
}
