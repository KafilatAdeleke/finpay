const { PrismaClient } = require("@prisma/client")
const { formatBalance } = require("../utils/moneyUtils")
const prisma = new PrismaClient()

// Get all wallets for a user
exports.getUserWallets = async (userId) => {
  return await prisma.wallet.findMany({
    where: { userId },
    orderBy: { currency: "asc" },
  })
}

// Get one wallet by userId + currency
exports.getUserWalletByCurrency = async (userId, currency) => {
  const upperCurrency = currency.toUpperCase()
  return await prisma.wallet.findFirst({
    where: {
      userId,
      currency: upperCurrency,
    },
  })
}
