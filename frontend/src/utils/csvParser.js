/**
 * csvParser.js - Robust CSV Parser for Bank Statements & Transaction Ledgers
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

export function parseCsvText(csvText) {
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

    // Resolve Date
    let dateStr = row.date || row.txndate || row.transactiondate || row.spent_on || row.received_on || ''
    if (!dateStr || !dateStr.includes('-')) {
      // Try parsing formats like DD/MM/YYYY or MM/DD/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            // Assume YYYY-MM-DD
            const y = parts[2]
            const m = parts[0].padStart(2, '0')
            const d = parts[1].padStart(2, '0')
            dateStr = `${y}-${m}-${d}`
          }
        }
      } else {
        dateStr = new Date().toISOString().slice(0, 10)
      }
    }

    // Resolve Amount & Type
    let type = 'expense'
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
      const amtStr = row.amount || row.amt || row.total || row.value || '0'
      const parsed = parseFloat(amtStr.replace(/[^0-9.-]/g, ''))
      if (!isNaN(parsed)) {
        if (parsed < 0) {
          type = 'expense'
          rawAmount = Math.abs(parsed)
        } else {
          rawAmount = parsed
          const explicitType = (row.type || row.transactiontype || '').toLowerCase()
          if (
            explicitType.includes('inc') ||
            explicitType.includes('cr') ||
            explicitType.includes('deposit') ||
            explicitType.includes('credit')
          ) {
            type = 'income'
          } else {
            type = 'expense'
          }
        }
      }
    }

    if (rawAmount <= 0) continue

    // Resolve Category
    let category = row.category || row.cat || row.tag || ''
    if (!category) {
      category = type === 'income' ? 'Salary' : 'Other'
    }

    // Resolve Note
    const note =
      row.note ||
      row.description ||
      row.desc ||
      row.title ||
      row.particulars ||
      row.memo ||
      row.details ||
      (type === 'income' ? 'Income' : 'Expense')

    results.push({
      type,
      amount: rawAmount,
      category: category.trim(),
      note: note.trim(),
      date: dateStr,
    })
  }

  return results
}

export default parseCsvText
