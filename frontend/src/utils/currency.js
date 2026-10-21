export const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee (INR)', code: 'INR' },
  USD: { symbol: '$', label: 'US Dollar (USD)', code: 'USD' },
  EUR: { symbol: '€', label: 'Euro (EUR)', code: 'EUR' },
  GBP: { symbol: '£', label: 'British Pound (GBP)', code: 'GBP' },
}

export function formatAmountWithCurrency(amount, currencyCode = 'INR') {
  const num = Number(amount) || 0
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
  return `${curr.symbol}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
