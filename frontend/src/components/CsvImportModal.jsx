import React, { useState } from 'react'
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

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
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
      } catch (err) {
        setError('Error reading CSV file. Please make sure it is valid text.')
        setParsedRows([])
      }
    }
    reader.readAsText(selected)
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

          <label style={{ display: 'block', marginBottom: '12px' }}>
            Choose CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={loading}
              style={{ marginTop: '6px' }}
            />
          </label>

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
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
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
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: row.type === 'income' ? 'var(--pos-soft)' : 'var(--soft)',
                              color: row.type === 'income' ? 'var(--pos)' : 'var(--ink)',
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
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {row.type === 'income' ? '+' : '-'}
                          {money(row.amount, currency)}
                        </td>
                      </tr>
                    ))}
                    {parsedRows.length > 6 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--mute)', fontSize: '12px' }}>
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
