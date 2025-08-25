// Fake rates for now (in production, use API like Fixer, OpenExchange, or Wise)
const EXCHANGE_RATES = {
  // Base: 1 unit of first currency = X of second
  USD_EUR: 0.85,
  EUR_USD: 1.18,
  USD_NGN: 1500,
  NGN_USD: 0.00067,
  EUR_NGN: 1700,
  NGN_EUR: 0.00059,
}

// Get exchange rate from cache or API (later)
exports.getExchangeRate = (from, to) => {
  const key = `${from}_${to}`
  const rate = EXCHANGE_RATES[key]

  if (rate === undefined) {
    throw new Error(`Exchange rate not available for ${from} → ${to}`)
  }

  return rate
}
