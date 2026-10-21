import { useState, useCallback } from 'react'

export function useToastSlice() {
  const [toast, setToast] = useState({ message: '', undo: false, hidden: true })

  const showToast = useCallback((message, undo = false) => {
    setToast({ message, undo, hidden: false })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, hidden: true }))
    }, 3500)
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, hidden: true }))
  }, [])

  return { toast, showToast, hideToast }
}
