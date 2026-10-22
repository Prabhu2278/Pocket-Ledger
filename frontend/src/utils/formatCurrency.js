export const CURRENCY_CONFIGS = {
  INR: { locale: 'en-IN', currency: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
}

export const CURRENCIES = CURRENCY_CONFIGS

export const money = (value, currencyCode = 'INR', options = {}) => {
  const code = (currencyCode || 'INR').toUpperCase()
  const conf = CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.INR

  try {
    const num = Number(value) || 0
    const hasDecimals = num % 1 !== 0
    return new Intl.NumberFormat(conf.locale, {
      style: 'currency',
      currency: conf.currency,
      maximumFractionDigits: options.maximumFractionDigits ?? (hasDecimals ? 2 : 0),
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      ...options,
    }).format(num)
  } catch {
    return `${conf.symbol}${Math.round(Number(value) || 0).toLocaleString()}`
  }
}

export function formatAmountWithCurrency(amount, currencyCode = 'INR', options = {}) {
  return money(amount, currencyCode, options)
}

export const formatCurrency = money
export default money
