export const EXPENSE_CATEGORIES = [
  ['Food', '#b42c45'],
  ['Transport', '#2563eb'],
  ['Home', '#0d7a6f'],
  ['Fun', '#9333ea'],
  ['Health', '#15803d'],
  ['Shopping', '#b45309'],
  ['Other', '#64748b'],
]

export const INCOME_CATEGORIES = [
  ['Salary', '#15803d'],
  ['Freelance', '#2563eb'],
  ['Business', '#b45309'],
  ['Investments', '#9333ea'],
  ['Gifts', '#ec4899'],
  ['Other', '#64748b'],
]

export const CATEGORIES = EXPENSE_CATEGORIES

export const CATEGORY_COLOR_MAP = Object.fromEntries([
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
])

export function getCategoryColor(category) {
  return CATEGORY_COLOR_MAP[category] || '#64748b'
}
