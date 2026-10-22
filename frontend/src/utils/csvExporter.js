/**
 * csvExporter.js - Utility to export transactions to a downloadable CSV file
 */

export function exportTransactionsToCsv(transactions, filename = 'pocket_ledger_transactions.csv') {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export.')
    return
  }

  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Wallet', 'Payment Method']
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = transactions.map((t) => {
    const walletLabel =
      (t.type || '').toLowerCase() === 'transfer' && t.to_wallet_name
        ? `${t.wallet_name || 'Wallet'} -> ${t.to_wallet_name}`
        : t.wallet_name || (t.wallet_id ? `Wallet #${t.wallet_id}` : '')

    return [
      escapeCell(t.date || t.spent_on || t.received_on || ''),
      escapeCell((t.type || 'expense').toUpperCase()),
      escapeCell(t.category || t.cat || ''),
      escapeCell(Number(t.amount || t.amt || 0).toFixed(2)),
      escapeCell(t.note || t.title || ''),
      escapeCell(walletLabel),
      escapeCell(t.payment_method || 'UPI'),
    ]
  })

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default exportTransactionsToCsv
