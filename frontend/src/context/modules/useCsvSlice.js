import { useState, useCallback } from 'react'
import { parseCsvText } from '../../utils/csvParser'

export function useCsvSlice(setData, showToast) {
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [parsedRows, setParsedRows] = useState([])

  const handleFileUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const rows = parseCsvText(text)
      setParsedRows(rows)
    }
    reader.readAsText(file)
  }, [])

  const confirmImport = useCallback(() => {
    if (!parsedRows.length) return
    setData((prev) => ({
      ...prev,
      tx: [...parsedRows.map((r, idx) => ({ ...r, id: Date.now() + idx, amt: r.amount, cat: r.category })), ...prev.tx],
      log: [{ t: Date.now(), txt: `Imported ${parsedRows.length} transactions via CSV` }, ...prev.log.slice(0, 19)],
    }))
    setCsvModalOpen(false)
    setParsedRows([])
    if (showToast) showToast(`Imported ${parsedRows.length} transactions`)
  }, [parsedRows, setData, showToast])

  return {
    csvModalOpen,
    setCsvModalOpen,
    parsedRows,
    setParsedRows,
    handleFileUpload,
    confirmImport,
  }
}
