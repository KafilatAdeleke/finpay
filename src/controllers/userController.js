// src/controllers/userController.js
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by middleware
    const { userId } = req.user

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
