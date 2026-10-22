export const EXPENSE_CATEGORIES = [
  ['Food', '#b42c45'],
  ['Transport', '#2563eb'],
  ['Shopping', '#b45309'],
  ['Bills', '#0284c7'],
  ['Home', '#0d7a6f'],
  ['Health', '#15803d'],
  ['Education', '#6366f1'],
  ['Entertainment', '#9333ea'],
  ['Fun', '#9333ea'],
  ['Travel', '#0ea5e9'],
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

// Dynamic registry to support custom categories
const dynamicColorMap = { ...CATEGORY_COLOR_MAP }

export function registerCategoryColors(categoryObjects = []) {
  if (Array.isArray(categoryObjects)) {
    categoryObjects.forEach((c) => {
      if (c && c.name && c.color) {
        dynamicColorMap[c.name] = c.color
        dynamicColorMap[c.name.toLowerCase()] = c.color
      }
    })
  }
}

export function getCategoryColor(category) {
  if (!category) return '#64748b'
  if (dynamicColorMap[category]) return dynamicColorMap[category]
  if (dynamicColorMap[category.toLowerCase()]) return dynamicColorMap[category.toLowerCase()]
  
  // Deterministic fallback color for any unknown custom categories
  const fallbackColors = ['#0284c7', '#0d9488', '#16a34a', '#ca8a04', '#ea580c', '#e11d48', '#9333ea', '#4f46e5']
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length]
}
