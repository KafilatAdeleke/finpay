// Fake card brands and number patterns
const CARD_BRANDS = ["Visa", "Mastercard"]
const BIN_NUMBERS = {
  Visa: "411111",
  Mastercard: "555555",
}

// Generate a fake card (never stores full number)
exports.generateFakeCard = (walletId, currency, brand = "Visa") => {
  const now = new Date()
  const last4 = (Math.floor(Math.random() * 9000) + 1000).toString() // Random 4-digit
  const expMonth = 12
  const expYear = now.getFullYear() + 4 // 4 years from now

  // We only store last 4, brand, expiry — never full PAN
  return {
    walletId,
    last4,
    brand,
    expMonth,
    expYear,
    currency,
    status: "active",
  }
}

// Generate a fake CVV for display (dev only)
exports.getFakeCVV = () => Math.floor(Math.random() * 900 + 100).toString() // 3-digit
