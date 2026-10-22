import React, { useState, useEffect } from 'react'
import { parseCsvText } from '../utils/csvParser'
import { money } from '../utils/formatCurrency'

export function CsvImportModal({
  isOpen,
  onClose,
  onImportConfirm,
  currency = 'INR',
}) {
  const [file, setFile] = useState(null)
  const [parsedRows, setParsedRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Scroll Lock: disable background/outside scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
      document.documentElement.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const processFile = (selected) => {
    if (!selected) return
    setFile(selected)
    setError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        const rows = parseCsvText(text)
        if (rows.length === 0) {
          setError('No valid transactions found in the CSV. Please check column headers.')
          setParsedRows([])
        } else {
          setParsedRows(rows)
        }
      } catch {
        setError('Error reading CSV file. Please make sure it is valid text.')
        setParsedRows([])
      }
    }
    reader.readAsText(selected)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    processFile(selected)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loading) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (loading) return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      if (!dropped.name.endsWith('.csv') && dropped.type !== 'text/csv') {
        setError('Please drop a valid .csv file.')
        return
      }
      processFile(dropped)
    }
  }

  const handleImport = async () => {
    if (parsedRows.length === 0) return
    setLoading(true)
    setError('')
    try {
      await onImportConfirm(parsedRows)
      setFile(null)
      setParsedRows([])
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to import transactions.')
    } finally {
      setLoading(false)
    }
  }

  const incomeCount = parsedRows.filter((r) => r.type === 'income').length
  const expenseCount = parsedRows.filter((r) => r.type === 'expense').length

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div className="dialog-content" style={{ maxWidth: '640px', width: '92%' }}>
        <div className="f">
          <h2 id="csv-modal-title">Import Transactions CSV</h2>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--mute)' }}>
            Upload a bank statement or CSV file containing dates, categories, notes, and amounts.
          </p>

          {/* Hidden accessible native file input */}
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />

          {/* Custom Styled Choose File Zone */}
          {!file ? (
            <label
              htmlFor="csv-file-input"
              className={`csv-upload-zone ${isDragging ? 'dragging' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="csv-upload-icon-circle" style={{ margin: '0 auto', alignSelf: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div className="csv-upload-prompt" style={{ textAlign: 'center', alignItems: 'center' }}>
                <span className="csv-upload-prompt-text">Drag and drop your bank CSV statement here</span>
                <span className="csv-upload-hint">or click to browse your computer</span>
              </div>

              <div className="csv-choose-btn" style={{ margin: '4px auto 0', alignSelf: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Choose File</span>
              </div>
            </label>
          ) : (
            <div className="csv-selected-file-card">
              <div className="csv-selected-file-info">
                <div className="csv-file-badge-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <div className="csv-selected-file-name" title={file.name}>
                    {file.name}
                  </div>
                  <span className="csv-selected-file-size">
                    {formatFileSize(file.size)} • Ready to import
                  </span>
                </div>
              </div>

              <label htmlFor="csv-file-input" className="csv-change-file-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Change File
              </label>
            </div>
          )}

          {error && (
            <p className="err" role="alert" style={{ margin: '4px 0 12px' }}>
              {error}
            </p>
          )}

          {parsedRows.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '13px',
                }}
              >
                <b>Detected {parsedRows.length} transactions</b>
                <span style={{ color: 'var(--mute)' }}>
                  {incomeCount} income · {expenseCount} expenses
                </span>
              </div>

              {/* Preview Table */}
              <div
                className="tw"
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--pl-border-default)',
                  borderRadius: 'var(--pl-radius-md)',
                  marginBottom: '16px',
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Note</th>
                      <th className="r">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 6).map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--pl-radius-sm)',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: row.type === 'income' ? 'var(--pl-color-success-soft)' : 'var(--pl-color-primary-soft)',
                              color: row.type === 'income' ? 'var(--pl-color-success)' : 'var(--pl-color-primary)',
                            }}
                          >
                            {row.type.toUpperCase()}
                          </span>
                        </td>
                        <td>{row.category}</td>
                        <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.note}
                        </td>
                        <td
                          className={`r ${row.type === 'income' ? 'pos' : 'neg'}`}
                          style={{ whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
                        >
                          {row.type === 'income' ? '+' : '-'}
                          {money(row.amount, currency)}
                        </td>
                      </tr>
                    ))}
                    {parsedRows.length > 6 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--pl-text-muted)', fontSize: '12px' }}>
                          + {parsedRows.length - 6} more transactions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="btns">
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              onClick={handleImport}
              disabled={loading || parsedRows.length === 0}
            >
              {loading ? 'Importing...' : `Confirm Import (${parsedRows.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CsvImportModal
