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
