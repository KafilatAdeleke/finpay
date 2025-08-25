const { PrismaClient } = require("@prisma/client")
const { generateFakeCard, getFakeCVV } = require("../utils/cardUtils")
const prisma = new PrismaClient()

// Create a new virtual card (fake)
exports.createCard = async (req, res) => {
  const { walletId, brand } = req.body
  const { userId } = req.user

  try {
    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId,
      },
    })

    if (!wallet) {
      return res
        .status(404)
        .json({ error: "Wallet not found or access denied" })
    }

    // Generate fake card data
    const cardData = generateFakeCard(
      walletId,
      wallet.currency,
      brand || "Visa"
    )

    // Save to DB
    const card = await prisma.virtualCard.create({
      data: cardData,
    })

    // Return card (with fake CVV for demo)
    res.status(201).json({
      message: "Virtual card created successfully",
      card: {
        ...card,
        cvv: getFakeCVV(),
      },
    })
  } catch (error) {
    console.error("Create card error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Get all cards for user
exports.getCards = async (req, res) => {
  const { userId } = req.user

  try {
    const cards = await prisma.virtualCard.findMany({
      where: {
        wallet: {
          userId,
        },
      },
      include: {
        wallet: true,
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ cards })
  } catch (error) {
    console.error("Get cards error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Freeze a card
exports.freezeCard = async (req, res) => {
  const { cardId } = req.params
  const { userId } = req.user

  try {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId },
      include: { wallet: true },
    })

    if (!card) {
      return res.status(404).json({ error: "Card not found" })
    }

    if (card.wallet.userId !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }

    const updated = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: "frozen" },
    })

    res.json({
      message: "Card frozen successfully",
      card: updated,
    })
  } catch (error) {
    console.error("Freeze card error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Unfreeze a card
exports.unfreezeCard = async (req, res) => {
  const { cardId } = req.params
  const { userId } = req.user

  try {
    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId },
      include: { wallet: true },
    })

    if (!card) {
      return res.status(404).json({ error: "Card not found" })
    }

    if (card.wallet.userId !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }

    const updated = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: "active" },
    })

    res.json({
      message: "Card unfrozen successfully",
      card: updated,
    })
  } catch (error) {
    console.error("Unfreeze card error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
