const CURRENCY_DECIMALS = {
  USD: 2,
  EUR: 2,
  NGN: 2,
}

// Format balance as string with correct decimals
exports.formatBalance = (amount, currency = "USD") => {
  const currencyUpper = currency.toUpperCase()
  const decimals = CURRENCY_DECIMALS[currencyUpper] || 2

  return parseFloat(amount).toFixed(decimals)
}

exports.parseBalance = (input) => {
  const num = parseFloat(input)
  if (isNaN(num)) {
    throw new Error("Invalid amount: must be a number")
  }
  if (num < 0) {
    throw new Error("Amount cannot be negative")
  }
  return num
}
