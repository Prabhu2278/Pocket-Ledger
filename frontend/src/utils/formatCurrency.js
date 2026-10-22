export const DEFAULT_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', label: '₹ Indian Rupee (INR)' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', label: '$ US Dollar (USD)' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', label: '€ Euro (EUR)' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', label: '£ British Pound (GBP)' },
]

export const POPULAR_CURRENCIES = [
  ...DEFAULT_CURRENCIES,
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', label: '¥ Japanese Yen (JPY)' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA', label: 'CA$ Canadian Dollar (CAD)' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', label: 'A$ Australian Dollar (AUD)' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', label: 'S$ Singapore Dollar (SGD)' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', label: 'د.إ UAE Dirham (AED)' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA', label: '﷼ Saudi Riyal (SAR)' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH', label: 'CHF Swiss Franc (CHF)' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', label: '¥ Chinese Yuan (CNY)' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ', label: 'NZ$ New Zealand Dollar (NZD)' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR', label: 'R$ Brazilian Real (BRL)' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA', label: 'R South African Rand (ZAR)' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR', label: '₩ South Korean Won (KRW)' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY', label: 'RM Malaysian Ringgit (MYR)' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH', label: '฿ Thai Baht (THB)' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID', label: 'Rp Indonesian Rupiah (IDR)' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH', label: '₱ Philippine Peso (PHP)' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', locale: 'ar-KW', label: 'KD Kuwaiti Dinar (KWD)' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', locale: 'ar-QA', label: 'QR Qatari Riyal (QAR)' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR', label: '₺ Turkish Lira (TRY)' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', locale: 'ru-RU', label: '₽ Russian Ruble (RUB)' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', locale: 'es-MX', label: 'Mex$ Mexican Peso (MXN)' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', locale: 'ar-BH', label: 'BD Bahraini Dinar (BHD)' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', locale: 'ar-OM', label: 'OMR Omani Rial (OMR)' },
]

export const CURRENCY_CONFIGS = {}

// Populate CURRENCY_CONFIGS with popular presets
POPULAR_CURRENCIES.forEach((c) => {
  CURRENCY_CONFIGS[c.code] = {
    locale: c.locale,
    currency: c.code,
    symbol: c.symbol,
    label: c.label || `${c.symbol} ${c.name} (${c.code})`,
  }
})

const CUSTOM_CURRENCIES_KEY = 'pocket_ledger_custom_currencies'

export const getCustomCurrencies = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_CURRENCIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const registerCurrency = (curr) => {
  if (!curr || !curr.code) return
  const code = curr.code.trim().toUpperCase()
  const conf = {
    locale: curr.locale || 'en-US',
    currency: code,
    symbol: curr.symbol || code,
    label: curr.label || `${curr.symbol || code} ${curr.name || code} (${code})`,
  }
  CURRENCY_CONFIGS[code] = conf
  return conf
}

export const saveCustomCurrency = (curr) => {
  try {
    const code = (curr.code || '').trim().toUpperCase()
    if (!code) return
    const list = getCustomCurrencies()
    const filtered = list.filter((c) => c.code !== code)
    const item = {
      code,
      name: curr.name || code,
      symbol: curr.symbol || code,
      locale: curr.locale || 'en-US',
      label: curr.label || `${curr.symbol || code} ${curr.name || code} (${code})`,
    }
    const updated = [...filtered, item]
    localStorage.setItem(CUSTOM_CURRENCIES_KEY, JSON.stringify(updated))
    registerCurrency(item)
    return updated
  } catch {
    return []
  }
}

export const removeCustomCurrency = (code) => {
  try {
    const list = getCustomCurrencies()
    const updated = list.filter((c) => c.code !== code)
    localStorage.setItem(CUSTOM_CURRENCIES_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

// Hydrate stored custom currencies
try {
  const stored = getCustomCurrencies()
  stored.forEach(registerCurrency)
} catch {
  // Ignore
}

export const CURRENCIES = CURRENCY_CONFIGS

export const money = (value, currencyCode = 'INR', options = {}) => {
  const code = (currencyCode || 'INR').toUpperCase()
  let conf = CURRENCY_CONFIGS[code]

  if (!conf) {
    const customList = getCustomCurrencies()
    const match = customList.find((c) => c.code === code)
    if (match) {
      conf = registerCurrency(match)
    }
  }

  if (!conf) {
    conf = {
      locale: 'en-US',
      currency: code,
      symbol: code,
      label: code,
    }
  }

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
    return `${conf.symbol} ${Math.round(Number(value) || 0).toLocaleString()}`
  }
}

export function formatAmountWithCurrency(amount, currencyCode = 'INR', options = {}) {
  return money(amount, currencyCode, options)
}

export const formatCurrency = money
export default money
