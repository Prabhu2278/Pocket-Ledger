const CURRENCY_CONFIGS = {
  INR: { locale: 'en-IN', currency: 'INR', symbol: '₹' },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$' },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£' },
}

export const money = (value, currencyCode = 'INR') => {
  const code = (currencyCode || 'INR').toUpperCase()
  const conf = CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.INR

  try {
    return new Intl.NumberFormat(conf.locale, {
      style: 'currency',
      currency: conf.currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0)
  } catch (e) {
    return `${conf.symbol}${Math.round(Number(value) || 0).toLocaleString()}`
  }
}

export const formatCurrency = money
export default money
