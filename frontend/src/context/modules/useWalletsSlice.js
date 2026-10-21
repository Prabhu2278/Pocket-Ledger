import { useState, useMemo, useCallback, useEffect } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

export function useWalletsSlice(currentUser, transactions = [], monthTransactions = [], setData = null, showToast = null) {
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState('all')
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState(null)
  const [deleteWalletId, setDeleteWalletId] = useState(null)

  // Fetch wallets directly from PostgreSQL Database
  const loadWalletsFromDb = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/wallets`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setWallets(data)
        }
      }
    } catch (e) {
      console.error('Failed to load wallets from DB:', e)
    }
  }, [])

  useEffect(() => {
    loadWalletsFromDb()
  }, [loadWalletsFromDb, currentUser])

  // Compute live wallet balances
  const computedWallets = useMemo(() => {
    return wallets.map((w) => {
      let balance = Number(w.initial_balance || w.current_balance) || 0
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

  const addWallet = useCallback(
    async (newWallet) => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/wallets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWallet),
        })
        if (res.ok) {
          await loadWalletsFromDb()
          if (showToast) showToast('Account saved to database')
        }
      } catch (err) {
        if (showToast) showToast('Failed to save account to database')
      }
    },
    [loadWalletsFromDb, showToast]
  )

  const updateWallet = useCallback(
    async (id, updatedData) => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/wallets/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        })
        if (res.ok) {
          await loadWalletsFromDb()
          if (showToast) showToast('Account updated in database')
        }
      } catch (err) {
        if (showToast) showToast('Failed to update account')
      }
    },
    [loadWalletsFromDb, showToast]
  )

  const deleteWallet = useCallback(
    async (id) => {
      try {
        await fetch(`${API_BASE}/api/v1/wallets/${id}`, { method: 'DELETE' })
        await loadWalletsFromDb()
        if (showToast) showToast('Account deleted from database')
      } catch (e) {
        if (showToast) showToast('Failed to delete account')
      }
    },
    [loadWalletsFromDb, showToast]
  )

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
    loadWalletsFromDb,
  }
}

export default useWalletsSlice
