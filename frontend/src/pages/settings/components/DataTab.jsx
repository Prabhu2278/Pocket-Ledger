import React from 'react'

export function DataTab({ onClearCache = () => {} }) {
  const handleExportJson = () => {
    const raw = localStorage.getItem('pocket-ledger-web-v1') || '{}'
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pocket-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pocket-settings-section">
      <h3>Data Backup & Restore</h3>
      <div className="pocket-settings-row">
        <div>
          <strong>Export Financial Records</strong>
          <p className="pocket-settings-desc">Download a complete JSON backup of all expenses and accounts</p>
        </div>
        <button
          type="button"
          className="pocket-ledger-btn-primary"
          onClick={handleExportJson}
        >
          Download Backup
        </button>
      </div>

      <h3 style={{ marginTop: '24px' }}>Storage Maintenance</h3>
      <div className="pocket-settings-row">
        <div>
          <strong>Reset Cached Ledger</strong>
          <p className="pocket-settings-desc">Clears all locally saved records and resets to initial defaults</p>
        </div>
        <button
          type="button"
          className="pocket-ledger-btn-cancel"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
          onClick={() => {
            if (window.confirm('Reset all local data back to initial defaults?')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
        >
          Reset Data
        </button>
      </div>
    </div>
  )
}

export default DataTab
