export function parseCsvText(csvText) {
  const lines = csvText.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))
  const results = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''))
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })

    const amount = parseFloat(row.amount || 0) || 0
    const category = row.category || 'General'
    const note = row.note || row.title || 'CSV Import'
    const date = row.date || row.spent_on || new Date().toISOString().slice(0, 10)
    const type = (row.type || 'EXPENSE').toUpperCase()

    results.push({ amount, category, note, date, type })
  }

  return results
}
