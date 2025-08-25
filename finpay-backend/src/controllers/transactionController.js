// src/controllers/transactionController.js
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const { getExchangeRate } = require("../config/exchangeRates")

// 🔁 1. Internal Transfer: Between user's own wallets
exports.internalTransfer = async (req, res) => {
  const { fromCurrency, toCurrency, amount, description } = req.body
  const { userId } = req.user

  if (!fromCurrency || !toCurrency || !amount) {
    return res
      .status(400)
      .json({ error: "fromCurrency, toCurrency, and amount are required" })
  }

  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()
  const numericAmount = parseFloat(amount)

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Valid positive amount is required" })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sourceWallet = await tx.wallet.findFirst({
        where: { userId, currency: from },
      })

      if (!sourceWallet) throw new Error(`Source wallet (${from}) not found`)
      if (sourceWallet.balance < numericAmount)
        throw new Error(`Insufficient balance`)

      const targetWallet = await tx.wallet.findFirst({
        where: { userId, currency: to },
      })

      if (!targetWallet) throw new Error(`Target wallet (${to}) not found`)

      // Deduct from source
      await tx.wallet.update({
        where: { id: sourceWallet.id },
        data: { balance: { decrement: numericAmount } },
      })

      // Convert and credit to target
      const rate = getExchangeRate(from, to)
      const convertedAmount = numericAmount * rate

      await tx.wallet.update({
        where: { id: targetWallet.id },
        data: { balance: { increment: convertedAmount } },
      })

      // Record transaction
      return await tx.transaction.create({
        data: {
          amount: numericAmount,
          currency: from,
          type: "internal_transfer",
          description: description || `Converted ${from} to ${to}`,
          status: "completed",
          walletId: sourceWallet.id,
          initiatorId: userId,
          metadata: {
            fromCurrency: from,
            toCurrency: to,
            exchangeRate: rate,
            receivedAmount: convertedAmount,
          },
        },
      })
    })

    res.status(201).json({
      message: `${from} → ${to} transfer completed`,
      transaction: result,
    })
  } catch (error) {
    console.error("Internal transfer error:", error)
    res.status(400).json({ error: error.message || "Transfer failed" })
  }
}

// 🌐 2. Send Payment to Another User
exports.sendPayment = async (req, res) => {
  const { recipientEmail, amount, currency, description } = req.body
  const { userId } = req.user

  if (!recipientEmail || !amount || !currency) {
    return res
      .status(400)
      .json({ error: "Recipient email, amount, and currency are required" })
  }

  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Valid positive amount is required" })
  }

  const upperCurrency = currency.toUpperCase()

  try {
    const result = await prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findFirst({
        where: { userId, currency: upperCurrency },
      })

      if (!senderWallet)
        throw new Error(`You don't have a ${upperCurrency} wallet`)
      if (senderWallet.balance < numericAmount)
        throw new Error(`Insufficient balance`)

      const recipient = await tx.user.findUnique({
        where: { email: recipientEmail },
      })

      if (!recipient) throw new Error("Recipient not found")
      if (recipient.id === userId)
        throw new Error("You cannot send money to yourself")

      const recipientWallet = await tx.wallet.findFirst({
        where: { userId: recipient.id, currency: upperCurrency },
      })

      if (!recipientWallet)
        throw new Error(`Recipient has no ${upperCurrency} wallet`)

      // Deduct from sender
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: numericAmount } },
      })

      // Credit to recipient
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: numericAmount } },
      })

      // Get sender info for transaction records
      const sender = await tx.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })

      // Record sender transaction
      const sentTx = await tx.transaction.create({
        data: {
          amount: numericAmount,
          currency: upperCurrency,
          type: "payment_sent",
          description: description || `Payment to ${recipientEmail}`,
          status: "completed",
          walletId: senderWallet.id,
          initiatorId: userId,
          counterpartyId: recipient.id,
          metadata: { recipientEmail },
        },
      })

      // Record recipient transaction
      const receivedTx = await tx.transaction.create({
        data: {
          amount: numericAmount,
          currency: upperCurrency,
          type: "payment_received",
          description: description || `Payment from ${sender.email}`,
          status: "completed",
          walletId: recipientWallet.id,
          initiatorId: userId,
          counterpartyId: userId,
          metadata: { senderEmail: sender.email },
        },
      })

      return { sentTx, receivedTx }
    })

    res.status(201).json({
      message: `Payment of ${numericAmount} ${upperCurrency} sent successfully`,
      transaction: result.sentTx,
    })
  } catch (error) {
    console.error("Send payment error:", error)
    res.status(400).json({ error: error.message || "Payment failed" })
  }
}

// 📊 Get Transaction History with Pagination & Search
exports.getTransactions = async (req, res) => {
  const { userId } = req.user
  const {
    type,
    currency,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 10,
  } = req.query

  // Convert to numbers
  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)
  const skip = (pageNumber - 1) * limitNumber

  // Base filter: user is initiator or receiver
  const filter = {
    OR: [{ initiatorId: userId }, { counterpartyId: userId }],
  }

  // Optional filters
  if (type) filter.type = type
  if (currency) filter.currency = currency.toUpperCase()

  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.gte = new Date(startDate)
    if (endDate) filter.createdAt.lte = new Date(endDate)
  }

  // Search in description (case-insensitive)
  if (search && search.trim() !== "") {
    filter.description = {
      contains: search.trim(),
      mode: "insensitive", // Case-insensitive
    }
  }

  try {
    // Get total count (for pagination UI)
    const totalCount = await prisma.transaction.count({ where: filter })

    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where: filter,
      include: {
        wallet: true,
        initiator: {
          select: { firstName: true, lastName: true, email: true },
        },
        counterparty: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    })

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limitNumber)

    res.json({
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNumber,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
      transactions,
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
