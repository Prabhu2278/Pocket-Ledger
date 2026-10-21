export const CATEGORIES = [
  ['Food', '#b42c45'],
  ['Transport', '#2563eb'],
  ['Home', '#0d7a6f'],
  ['Fun', '#9333ea'],
  ['Health', '#15803d'],
  ['Shopping', '#b45309'],
  ['Other', '#64748b'],
]

export const CATEGORY_COLOR_MAP = Object.fromEntries(CATEGORIES)

export function getCategoryColor(category) {
  return CATEGORY_COLOR_MAP[category] || '#64748b'
}
