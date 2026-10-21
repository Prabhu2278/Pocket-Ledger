import React, { useState } from 'react'
import { parseCsvText } from '../../utils/csvParser'

export function CsvImportModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = (event) => {
        const rows = parseCsvText(event.target.result)
        setPreview(rows)
      }
      reader.readAsText(f)
    }
  }

  const handleConfirm = () => {
    if (preview.length && onImport) {
      onImport(preview)
      onClose()
    }
  }

  return (
    <div className="pocket-ledger-dialog-overlay" onClick={onClose}>
      <div className="pocket-ledger-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pocket-ledger-dialog-header">
          <h2>Import CSV Bank Statement</h2>
          <button type="button" className="pocket-ledger-dialog-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '16px 0' }}>
          <input
            type="file"
            accept=".csv"
            className="pocket-ledger-input"
            onChange={handleFileChange}
          />
          {preview.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--pocket-muted)' }}>
              Detected <strong>{preview.length}</strong> transactions ready to import.
            </div>
          )}
        </div>
        <div className="pocket-ledger-dialog-actions">
          <button type="button" className="pocket-ledger-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="pocket-ledger-btn-primary"
            disabled={!preview.length}
            onClick={handleConfirm}
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  )
}

export default CsvImportModal
