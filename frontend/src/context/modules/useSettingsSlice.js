import { useState, useCallback } from 'react'

export function useSettingsSlice(showToast) {
  const [currency, setCurrency] = useState('INR')
  const [activeTab, setActiveTab] = useState('security')

  const changeCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency)
    if (showToast) showToast(`Currency set to ${newCurrency}`)
  }, [showToast])

  return {
    currency,
    setCurrency: changeCurrency,
    activeTab,
    setActiveTab,
  }
}
