export const EXPENSE_CATEGORIES = [
  ['Food', '#b42c45'],
  ['Transport', '#2563eb'],
  ['Shopping', '#b45309'],
  ['Bills', '#0284c7'],
  ['Home', '#0d7a6f'],
  ['Health', '#15803d'],
  ['Education', '#6366f1'],
  ['Entertainment', '#9333ea'],
  ['Fun', '#ef4444'],
  ['Travel', '#0ea5e9'],
  ['Other', '#64748b'],
]

export const INCOME_CATEGORIES = [
  ['Salary', '#10b981'],
  ['Freelance', '#3b82f6'],
  ['Business', '#d97706'],
  ['Investments', '#8b5cf6'],
  ['Gifts', '#ec4899'],
  ['Other', '#475569'],
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

export const EXTENDED_CATEGORY_PALETTE = [
  '#b42c45', // Crimson
  '#2563eb', // Royal Blue
  '#15803d', // Forest Emerald
  '#b45309', // Amber Brown
  '#0d7a6f', // Deep Teal
  '#9333ea', // Purple
  '#ec4899', // Pink
  '#0284c7', // Sky Blue
  '#6366f1', // Indigo
  '#0ea5e9', // Ocean
  '#64748b', // Slate Gray
  '#10b981', // Emerald Mint
  '#f59e0b', // Golden Amber
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Bright Orange
  '#a855f7', // Soft Purple
  '#e11d48', // Bright Ruby
  '#84cc16', // Lime Green
  '#d946ef', // Bright Fuchsia
  '#22c55e', // Vibrant Green
  '#eab308', // Warm Yellow
  '#4f46e5', // Deep Indigo
  '#059669', // Dark Emerald
  '#db2777', // Deep Magenta
  '#ea580c', // Burnt Orange
  '#7c3aed', // Deep Violet
  '#0891b2', // Deep Ocean
  '#8b5cf6', // Violet
  '#f43f5e', // Coral Pink
  '#16a34a', // Leaf Green
  '#ca8a04', // Bronze
  '#be185d', // Berry Pink
  '#4338ca', // Dark Royal
  '#0f766e', // Pine Teal
  '#d97706', // Ochre
]

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function getUniqueCategoryColor(existingCategories = []) {
  const used = new Set()

  // 1. Gather all default category colors
  EXPENSE_CATEGORIES.forEach(([, col]) => used.add(col.toLowerCase().trim()))
  INCOME_CATEGORIES.forEach(([, col]) => used.add(col.toLowerCase().trim()))

  // 2. Gather dynamic registered colors
  Object.values(dynamicColorMap).forEach((col) => {
    if (col && typeof col === 'string') used.add(col.toLowerCase().trim())
  })

  // 3. Gather existing categories passed as argument
  if (Array.isArray(existingCategories)) {
    existingCategories.forEach((c) => {
      const col = c?.color || (Array.isArray(c) ? c[1] : null)
      if (col && typeof col === 'string') used.add(col.toLowerCase().trim())
    })
  }

  // 4. Find unused colors from curated extended palette
  const unusedPalette = EXTENDED_CATEGORY_PALETTE.filter(
    (col) => !used.has(col.toLowerCase().trim())
  )

  if (unusedPalette.length > 0) {
    const idx = Math.floor(Math.random() * unusedPalette.length)
    return unusedPalette[idx]
  }

  // 5. Dynamic random HSL color generation guaranteed to not collide
  for (let attempt = 0; attempt < 60; attempt++) {
    const randomHue = Math.floor(Math.random() * 360)
    const genColor = hslToHex(randomHue, 74, 48)
    if (!used.has(genColor.toLowerCase())) {
      return genColor
    }
  }

  return '#ec4899'
}
