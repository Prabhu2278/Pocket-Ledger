export const isoDate = (date = new Date()) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatMonthDisplay = (year, month) => {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonthKey(dateObj = new Date()) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getMonthLabel(monthKey) {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return formatMonthKey(d)
}

export default {
  isoDate,
  formatDisplayDate,
  formatMonthDisplay,
  formatMonthKey,
  getMonthLabel,
  shiftMonth,
}
