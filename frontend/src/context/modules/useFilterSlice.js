import { useState } from 'react'

export function useFilterSlice() {
  const [filter, setFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('all')

  return {
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    selectedWallet,
    setSelectedWallet,
  }
}
