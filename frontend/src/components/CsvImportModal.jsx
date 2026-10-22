import React, { useState, useEffect, useMemo } from 'react'
import { parseCsvText } from '../utils/csvParser'
import { money } from '../utils/formatCurrency'
import { categoryApi } from '../api/categoryApi'

export function CsvImportModal({
  isOpen,
  onClose,
  onImportConfirm,
  currency = 'INR',
  wallets = [],
  categories = [],
  refreshCategories,
  showToast,
}) {
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Local copy of categories
  const [localCategories, setLocalCategories] = useState(categories)

  // Target wallet state (Mandatory)
  const [selectedWalletId, setSelectedWalletId] = useState('')

  // Synchronize localCategories with categories prop
  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories)
    }
  }, [categories])

  // Set initial default wallet
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id)
    }
  }, [wallets, selectedWalletId])

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

  // Re-parse rows when selectedWalletId, rawText, wallets, or localCategories change
  useEffect(() => {
    if (!rawText) return
    const defaultWallet = wallets.find((w) => String(w.id) === String(selectedWalletId)) || wallets[0] || null
    const rows = parseCsvText(rawText, defaultWallet, wallets, localCategories)
    setParsedRows(rows)
  }, [selectedWalletId, rawText, wallets, localCategories])

  // Detect unlisted categories from the CSV that do not yet exist in the DB / Settings
  const newCategoriesFromCsv = useMemo(() => {
    const newMap = new Map()
    const existingLower = new Set(localCategories.map((c) => c.name.toLowerCase()))

    parsedRows.forEach((r) => {
      const catName = (r.category || r.rawCategory || '').trim()
      if (!catName) return
      if (!existingLower.has(catName.toLowerCase()) && !newMap.has(catName.toLowerCase())) {
        newMap.set(catName.toLowerCase(), {
          name: catName,
          type: r.type || 'expense',
        })
      }
    })
    return Array.from(newMap.values())
  }, [parsedRows, localCategories])

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
        setRawText(text)
        const defaultWallet = wallets.find((w) => String(w.id) === String(selectedWalletId)) || wallets[0] || null
        const rows = parseCsvText(text, defaultWallet, wallets, localCategories)
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

  // Update an editable row field inline (Date, Type, Wallet, Note, Amount)
  const updateRowField = (idx, field, value) => {
    setParsedRows((prev) => {
      const copy = [...prev]
      const row = { ...copy[idx], [field]: value }

      // If updating wallet, also update wallet_name
      if (field === 'wallet_id') {
        const w = wallets.find((item) => String(item.id) === String(value))
        row.wallet_name = w ? w.name : ''
      }

      // Re-validate row
      const missing = []
      if (!row.date || !row.date.trim()) missing.push('Date')
      if (!row.type || !row.type.trim()) missing.push('Type')
      if (!row.category || !row.category.trim()) missing.push('Category')
      if (!row.wallet_id) missing.push('Wallet')
      if (!row.note || !row.note.trim()) missing.push('Note')
      if (!row.amount || Number(row.amount) <= 0) missing.push('Amount')

      row.isValid = missing.length === 0
      row.missingFields = missing

      copy[idx] = row
      return copy
    })
  }

  // Validate entire dataset
  const invalidRows = parsedRows.filter((r) => !r.isValid)
  const isAllValid = parsedRows.length > 0 && invalidRows.length === 0

  // Save and Import handler: auto-creates new categories in DB and Settings, then imports
  const handleImport = async () => {
    if (!isAllValid) {
      setError('All data fields (Date, Type, Category, Wallet, Note, Amount) are mandatory. Please fill missing values.')
      return
    }

    setLoading(true)
    setError('')
    try {
      // 1. If any imported rows contain categories not in the DB, create them in the DB & Settings
      if (newCategoriesFromCsv.length > 0) {
        for (const nc of newCategoriesFromCsv) {
          try {
            await categoryApi.createCategory({
              name: nc.name,
              type: nc.type,
              color: '#2563eb',
              icon: 'tag',
            })
          } catch {
            // If already created or handled by backend, continue safely
          }
        }
      }

      // 2. Perform transaction bulk import
      await onImportConfirm(parsedRows)

      // 3. Refresh categories so Settings and the rest of the application reflect the new categories
      if (refreshCategories) {
        await refreshCategories()
      }

      if (showToast) {
        if (newCategoriesFromCsv.length > 0) {
          showToast(`Imported ${parsedRows.length} transactions and saved ${newCategoriesFromCsv.length} new category/categories to Settings & DB!`)
        } else {
          showToast(`Imported ${parsedRows.length} transactions successfully.`)
        }
      }

      setFile(null)
      setRawText('')
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
      <div
        className="dialog-content"
        style={{
          maxWidth: '860px',
          width: '94%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '18px 22px 14px',
        }}
      >
        <div className="f" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Header - Compact */}
          <div style={{ flexShrink: 0 }}>
            <h2 id="csv-modal-title" style={{ margin: '0 0 2px', fontSize: '17px' }}>
              Import Transactions CSV
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--mute)' }}>
              Categories are identified directly from your CSV. New categories are saved to Settings & DB upon Save & Import.
            </p>
          </div>

          {/* Hidden accessible native file input */}
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />

          {/* Upload Zone (when no file selected yet) */}
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
                padding: '28px 16px',
                flexShrink: 0,
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
            /* Compact Unified File & Target Wallet Controls Bar */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '7px 12px',
                background: 'var(--pl-bg-surface-hover, #1b2334)',
                border: '1px solid var(--pl-border-default, #1e293e)',
                borderRadius: '8px',
                marginBottom: '8px',
                flexShrink: 0,
              }}
            >
              {/* Left: File details + Change button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pl-color-success, #10b981)', flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--pl-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--mute)', whiteSpace: 'nowrap' }}>
                  ({formatFileSize(file.size)} &bull; {parsedRows.length} rows)
                </span>
                <label
                  htmlFor="csv-file-input"
                  style={{
                    fontSize: '11px',
                    color: 'var(--pl-color-primary, #818cf8)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Change
                </label>
              </div>

              {/* Right: Target Wallet Selector */}
              {wallets && wallets.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <label
                    htmlFor="csv-target-wallet"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--pl-text-primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Target Wallet <span style={{ color: 'var(--pl-color-danger, #ef4444)' }}>*</span>:
                  </label>
                  <select
                    id="csv-target-wallet"
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    style={{
                      height: '28px',
                      padding: '2px 8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1.5px solid var(--pl-color-primary)',
                      background: 'var(--pl-bg-surface)',
                      color: 'var(--pl-text-primary)',
                      cursor: 'pointer',
                      maxWidth: '220px',
                    }}
                    required
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({money(w.balance || 0, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Slim New Categories Notice */}
          {newCategoriesFromCsv.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '6px',
                marginBottom: '6px',
                fontSize: '11px',
                color: 'var(--pl-text-primary)',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pl-color-primary)', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <b>{newCategoriesFromCsv.length} new category/categories detected:</b> {newCategoriesFromCsv.map((u) => `"${u.name}"`).join(', ')}. Saved automatically on Save & Import.
              </span>
            </div>
          )}

          {error && (
            <div
              className="err"
              role="alert"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--pl-color-danger, #ef4444)',
                fontSize: '11.5px',
                marginBottom: '6px',
                flexShrink: 0,
              }}
            >
              {error}
            </div>
          )}

          {/* Slim Validation Notice when mandatory fields are missing */}
          {invalidRows.length > 0 && (
            <div
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: 'var(--pl-color-warning, #f59e0b)',
                fontSize: '11px',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                <b>{invalidRows.length} row(s) missing mandatory data.</b> Fill highlighted fields to confirm import.
              </span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {/* Row Stats - Compact */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '11.5px',
                  flexShrink: 0,
                }}
              >
                <span>
                  <b>All {parsedRows.length} transactions</b>{' '}
                  <span style={{ fontSize: '10.5px', color: 'var(--mute)' }}>
                    (scroll inside table to inspect rows)
                  </span>
                </span>
                <span style={{ color: 'var(--mute)' }}>
                  {incomeCount} income &bull; {expenseCount} expense
                </span>
              </div>

              {/* Table Container - Moved up with generous height */}
              <div
                className="csv-table-scroll-container"
                style={{
                  height: '270px',
                  maxHeight: '330px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  overscrollBehavior: 'contain',
                  border: '1.5px solid var(--pl-border-default)',
                  borderRadius: 'var(--pl-radius-md, 8px)',
                  marginBottom: '8px',
                  position: 'relative',
                  background: 'var(--pl-bg-surface)',
                  flexShrink: 0,
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
                  <thead>
                    <tr>
                      <th style={fixedHeaderStyle}>#</th>
                      <th style={fixedHeaderStyle}>Date *</th>
                      <th style={fixedHeaderStyle}>Type *</th>
                      <th style={fixedHeaderStyle}>Category</th>
                      <th style={fixedHeaderStyle}>Wallet *</th>
                      <th style={fixedHeaderStyle}>Note *</th>
                      <th style={{ ...fixedHeaderStyle, textAlign: 'right' }}>Amount *</th>
                      <th style={{ ...fixedHeaderStyle, textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => {
                      const isRowValid = row.isValid

                      const isRowCatInDb = localCategories.some(
                        (c) => c.name.toLowerCase() === (row.category || '').toLowerCase()
                      )

                      return (
                        <tr
                          key={idx}
                          style={{
                            height: '38px',
                            background: isRowValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                            borderBottom: '1px solid var(--pl-border-default)',
                          }}
                        >
                          <td style={{ ...tdStyle, color: 'var(--mute)', fontSize: '11px', width: '32px' }}>
                            {idx + 1}
                          </td>

                          {/* Date (Mandatory) */}
                          <td style={tdStyle}>
                            <input
                              type="date"
                              value={row.date || ''}
                              onChange={(e) => updateRowField(idx, 'date', e.target.value)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '11.5px',
                                height: '26px',
                                minHeight: '26px',
                                width: '125px',
                                borderRadius: '5px',
                                border: row.date ? '1px solid var(--pl-border-default)' : '1.5px solid var(--pl-color-danger, #ef4444)',
                                background: 'var(--pl-bg-surface)',
                                color: 'var(--pl-text-primary)',
                              }}
                              required
                            />
                          </td>

                          {/* Type (Mandatory) */}
                          <td style={tdStyle}>
                            <select
                              value={row.type || 'expense'}
                              onChange={(e) => updateRowField(idx, 'type', e.target.value)}
                              style={{
                                padding: '1px 6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                height: '26px',
                                minHeight: '26px',
                                borderRadius: '5px',
                                border: '1px solid var(--pl-border-default)',
                                background: row.type === 'income' ? 'var(--pl-color-success-soft)' : 'var(--pl-color-primary-soft)',
                                color: row.type === 'income' ? 'var(--pl-color-success)' : 'var(--pl-color-primary)',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="expense">EXPENSE</option>
                              <option value="income">INCOME</option>
                            </select>
                          </td>

                          {/* Category (Unchangeable from CSV - Clear & Contrast Adaptive) */}
                          <td style={tdStyle}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: 'var(--pl-text-primary, currentColor)',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  background: 'var(--pl-bg-surface-hover, rgba(0, 0, 0, 0.05))',
                                  border: '1px solid var(--pl-border-default, rgba(0, 0, 0, 0.12))',
                                  display: 'inline-block',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.category || <span style={{ color: 'var(--pl-color-danger, #ef4444)' }}>Missing</span>}
                              </span>

                              {/* Indicator showing if this category is already in DB or newly identified */}
                              {!isRowCatInDb && row.category && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    background: 'var(--pl-color-primary-soft, rgba(37, 99, 235, 0.14))',
                                    color: 'var(--pl-color-primary, #2563eb)',
                                    textTransform: 'uppercase',
                                    border: '1px solid var(--pl-color-primary-soft, rgba(37, 99, 235, 0.25))',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title="New category from CSV. Will be automatically created in Settings & DB upon Save & Import."
                                >
                                  New
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Wallet (Mandatory) */}
                          <td style={tdStyle}>
                            <select
                              value={row.wallet_id || selectedWalletId}
                              onChange={(e) => updateRowField(idx, 'wallet_id', Number(e.target.value))}
                              style={{
                                padding: '2px 6px',
                                fontSize: '11.5px',
                                height: '26px',
                                minHeight: '26px',
                                minWidth: '120px',
                                borderRadius: '5px',
                                border: row.wallet_id || selectedWalletId ? '1px solid var(--pl-border-default)' : '1.5px solid var(--pl-color-danger, #ef4444)',
                                background: 'var(--pl-bg-surface)',
                                color: 'var(--pl-text-primary)',
                                cursor: 'pointer',
                              }}
                              required
                            >
                              {wallets.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Note (Mandatory) */}
                          <td style={tdStyle}>
                            <input
                              type="text"
                              value={row.note || ''}
                              placeholder="Required note"
                              onChange={(e) => updateRowField(idx, 'note', e.target.value)}
                              style={{
                                padding: '2px 8px',
                                fontSize: '11.5px',
                                height: '26px',
                                minHeight: '26px',
                                width: '150px',
                                borderRadius: '5px',
                                border: row.note ? '1px solid var(--pl-border-default)' : '1.5px solid var(--pl-color-danger, #ef4444)',
                                background: 'var(--pl-bg-surface)',
                                color: 'var(--pl-text-primary)',
                              }}
                              required
                            />
                          </td>

                          {/* Amount (Mandatory) */}
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            <input
                              type="number"
                              step="any"
                              value={row.amount || ''}
                              placeholder="0.00"
                              onChange={(e) => updateRowField(idx, 'amount', parseFloat(e.target.value) || 0)}
                              style={{
                                padding: '2px 8px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                height: '26px',
                                minHeight: '26px',
                                width: '85px',
                                textAlign: 'right',
                                borderRadius: '5px',
                                border: row.amount > 0 ? '1px solid var(--pl-border-default)' : '1.5px solid var(--pl-color-danger, #ef4444)',
                                background: 'var(--pl-bg-surface)',
                                color: row.type === 'income' ? 'var(--pl-color-success)' : 'var(--pl-color-danger)',
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                              required
                            />
                          </td>

                          {/* Mandatory Status Indicator */}
                          <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {isRowValid ? (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 'var(--pl-radius-pill, 9999px)',
                                  background: 'var(--pl-color-success-soft)',
                                  color: 'var(--pl-color-success)',
                                }}
                              >
                                Ready
                              </span>
                            ) : (
                              <span
                                title={`Missing mandatory: ${row.missingFields?.join(', ')}`}
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: 'var(--pl-radius-pill, 9999px)',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: 'var(--pl-color-danger, #ef4444)',
                                  cursor: 'help',
                                }}
                              >
                                Missing {row.missingFields?.[0] || 'Field'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons: Save & Import */}
          <div className="btns" style={{ marginTop: '4px', paddingTop: '6px', flexShrink: 0 }}>
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
              disabled={loading || parsedRows.length === 0 || !isAllValid}
              style={{
                opacity: loading || parsedRows.length === 0 || !isAllValid ? 0.6 : 1,
                cursor: loading || parsedRows.length === 0 || !isAllValid ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? 'Saving & Importing...'
                : !isAllValid && parsedRows.length > 0
                ? `Resolve Missing Data (${invalidRows.length} incomplete)`
                : `Save & Import (${parsedRows.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sticky header style
const fixedHeaderStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: 'var(--pl-bg-surface, #131926)',
  color: 'var(--pl-text-muted, #94a3b8)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '8px 10px',
  borderBottom: '1.5px solid var(--pl-border-default, #1e293e)',
  boxShadow: '0 1px 0 var(--pl-border-default, #1e293e)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

// Table cell style
const tdStyle = {
  padding: '4px 10px',
  verticalAlign: 'middle',
  borderBottom: '1px solid var(--pl-border-default, #1e293e)',
  whiteSpace: 'nowrap',
}

export default CsvImportModal
