export const CURRENCY_CONFIGS = {
  INR: { locale: 'en-IN', currency: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
}

export const CURRENCIES = CURRENCY_CONFIGS

export const money = (value, currencyCode = 'INR') => {
  const code = (currencyCode || 'INR').toUpperCase()
  const conf = CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.INR

  try {
    return new Intl.NumberFormat(conf.locale, {
      style: 'currency',
      currency: conf.currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0)
  } catch {
    return `${conf.symbol}${Math.round(Number(value) || 0).toLocaleString()}`
  }
}

export function formatAmountWithCurrency(amount, currencyCode = 'INR') {
  return money(amount, currencyCode)
}

export const formatCurrency = money
export default money
