/**
 * csvParser.js - Robust CSV Parser for Bank Statements & Transaction Ledgers
 * Enforces mandatory data fields: Date, Type, Category, Wallet, Note, Amount
 */

// Splits a CSV line handling quoted values with commas
function splitCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^["']|["']$/g, ''))
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim().replace(/^["']|["']$/g, ''))
  return values
}

export function parseCsvText(csvText, defaultWallet = null, availableWallets = [], availableCategories = []) {
  if (!csvText || typeof csvText !== 'string') return []

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const rawHeaders = splitCsvLine(lines[0])
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''))

  const results = []

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i])
    if (values.length === 0 || values.every((v) => !v)) continue

    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })

    // 1. Resolve Date (MANDATORY)
    const rawDate = (
      row.date ||
      row.txndate ||
      row.transactiondate ||
      row.spent_on ||
      row.received_on ||
      row.dateoftransaction ||
      ''
    ).trim()

    let dateStr = ''
    if (rawDate) {
      if (rawDate.includes('-')) {
        const parts = rawDate.split('-')
        if (parts[0].length === 4) {
          dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
        } else if (parts[2].length === 4) {
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        } else {
          dateStr = rawDate
        }
      } else if (rawDate.includes('/')) {
        const parts = rawDate.split('/')
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
          } else if (parts[0].length === 4) {
            dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
          }
        }
      } else {
        dateStr = rawDate
      }
    }

    // 2. Resolve Amount & Type (MANDATORY)
    let type = ''
    let rawAmount = 0
    const debitVal = parseFloat(row.debit || row.dr || 0)
    const creditVal = parseFloat(row.credit || row.cr || 0)

    if (creditVal > 0) {
      type = 'income'
      rawAmount = creditVal
    } else if (debitVal > 0) {
      type = 'expense'
      rawAmount = debitVal
    } else {
      const amtStr = row.amount || row.amt || row.total || row.value || ''
      const parsed = parseFloat(amtStr.replace(/[^0-9.-]/g, ''))
      if (!isNaN(parsed) && amtStr !== '') {
        if (parsed < 0) {
          type = 'expense'
          rawAmount = Math.abs(parsed)
        } else {
          rawAmount = parsed
          const explicitType = (row.type || row.transactiontype || row.category_type || '').toLowerCase().trim()
          if (
            explicitType.includes('inc') ||
            explicitType.includes('cr') ||
            explicitType.includes('deposit') ||
            explicitType.includes('credit')
          ) {
            type = 'income'
          } else if (
            explicitType.includes('exp') ||
            explicitType.includes('dr') ||
            explicitType.includes('withdrawal') ||
            explicitType.includes('debit')
          ) {
            type = 'expense'
          } else {
            type = 'expense'
          }
        }
      }
    }

    // 3. Resolve Category (MANDATORY)
    const rawCategory = (
      row.category ||
      row.cat ||
      row.tag ||
      row.categoryname ||
      ''
    ).trim()

    let matchedCategory = rawCategory
    let isCategoryListed = false

    if (rawCategory && Array.isArray(availableCategories) && availableCategories.length > 0) {
      // 1. Try match by name and matching type
      const matched = availableCategories.find(
        (c) =>
          c.name.trim().toLowerCase() === rawCategory.toLowerCase() &&
          (!type || c.type.toLowerCase() === type.toLowerCase())
      ) || availableCategories.find(
        (c) => c.name.trim().toLowerCase() === rawCategory.toLowerCase()
      )

      if (matched) {
        matchedCategory = matched.name
        isCategoryListed = true
      }
    }

    // 4. Resolve Note (MANDATORY)
    const note = (
      row.note ||
      row.description ||
      row.desc ||
      row.title ||
      row.particulars ||
      row.memo ||
      row.details ||
      row.narration ||
      ''
    ).trim()

    // 5. Resolve Wallet (MANDATORY)
    const rawWallet = (
      row.wallet ||
      row.walletname ||
      row.account ||
      row.accountname ||
      row.targetwallet ||
      row.wallet_id ||
      row.walletid ||
      ''
    ).trim()

    let wallet_id = null
    let wallet_name = ''

    if (rawWallet && Array.isArray(availableWallets) && availableWallets.length > 0) {
      const matched = availableWallets.find(
        (w) =>
          String(w.id) === rawWallet ||
          w.name.toLowerCase() === rawWallet.toLowerCase() ||
          rawWallet.toLowerCase().includes(w.name.toLowerCase())
      )
      if (matched) {
        wallet_id = matched.id
        wallet_name = matched.name
      }
    }

    if (!wallet_id && defaultWallet) {
      wallet_id = defaultWallet.id
      wallet_name = defaultWallet.name
    }

    if (!wallet_name && rawWallet) {
      wallet_name = rawWallet
    }

    // Check mandatory fields
    const missing = []
    if (!dateStr) missing.push('Date')
    if (!type) missing.push('Type')
    if (!matchedCategory) missing.push('Category')
    if (!wallet_id && !wallet_name) missing.push('Wallet')
    if (!note) missing.push('Note')
    if (!rawAmount || rawAmount <= 0) missing.push('Amount')

    results.push({
      id: i,
      date: dateStr,
      type: type || 'expense',
      amount: rawAmount,
      category: matchedCategory,
      rawCategory: rawCategory,
      isCategoryListed: isCategoryListed,
      note: note,
      wallet_id: wallet_id,
      wallet_name: wallet_name,
      isValid: missing.length === 0,
      missingFields: missing,
    })
  }

  return results
}

export default parseCsvText
