export const CATEGORIES = [
  { name: 'Food', color: '#b42c45' },
  { name: 'Transport', color: '#2563eb' },
  { name: 'Home', color: '#0d7a6f' },
  { name: 'Fun', color: '#9333ea' },
  { name: 'Health', color: '#15803d' },
  { name: 'Shopping', color: '#b45309' },
  { name: 'Other', color: '#64748b' },
]

export const getCategoryColor = (catName) => {
  if (!catName) return '#64748b'
  const found = CATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase())
  return found ? found.color : '#64748b'
}

export default CATEGORIES
