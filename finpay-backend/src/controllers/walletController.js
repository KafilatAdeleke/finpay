const { PrismaClient } = require("@prisma/client")
const { formatBalance } = require("../utils/moneyUtils")
const { getUserWalletByCurrency } = require("../services/walletService")

const prisma = new PrismaClient()

const SUPPORTED_CURRENCIES = ["USD", "EUR", "NGN"]

// Create a new wallet
exports.createWallet = async (req, res) => {
  const { currency } = req.body
  const { userId } = req.user

  // Validate currency
  if (!currency) {
    return res.status(400).json({ error: "Currency is required" })
  }

  const upperCurrency = currency.toUpperCase()

  if (!SUPPORTED_CURRENCIES.includes(upperCurrency)) {
    return res.status(400).json({
      error: `Currency not supported. Supported: ${SUPPORTED_CURRENCIES.join(
        ", "
      )}`,
    })
  }

  try {
    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        currency: upperCurrency,
      },
    })

    if (existingWallet) {
      return res.status(409).json({
        error: `You already have a ${upperCurrency} wallet`,
      })
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        currency: upperCurrency,
        balance: 0.0,
      },
    })

    res.status(201).json({
      message: `${upperCurrency} wallet created successfully`,
      wallet: {
        ...wallet,
        balance: formatBalance(wallet.balance, upperCurrency),
      },
    })
  } catch (error) {
    console.error("Create wallet error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get all user's wallets
exports.getWallets = async (req, res) => {
  const { userId } = req.user

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { currency: "asc" },
    })

    // Format balances before sending
    const formattedWallets = wallets.map((wallet) => ({
      ...wallet,
      balance: formatBalance(wallet.balance, wallet.currency),
    }))

    res.json({
      wallets: formattedWallets,
    })
  } catch (error) {
    console.error("Get wallets error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get a single wallet by currency (e.g., /usd)
exports.getWalletByCurrency = async (req, res) => {
  const { userId } = req.user
  const { currency } = req.params

  if (!currency) {
    return res.status(400).json({ error: "Currency is required" })
  }

  try {
    const wallet = await getUserWalletByCurrency(userId, currency)

    if (!wallet) {
      return res.status(404).json({
        error: `You don't have a ${currency.toUpperCase()} wallet`,
      })
    }

    res.json({
      wallet: {
        ...wallet,
        balance: formatBalance(wallet.balance, wallet.currency),
      },
    })
  } catch (error) {
    console.error("Get wallet by currency error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
