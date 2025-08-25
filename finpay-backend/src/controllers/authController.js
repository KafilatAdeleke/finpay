const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const { formatBalance } = require("../utils/moneyUtils")

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

// Register a new user
exports.register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required" })
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 👇 Start a transaction: create user AND wallet together
    const user = await prisma.$transaction(async (tx) => {
      // 1. Create the user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      })

      // 2. Create a default USD wallet for the user
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          currency: "USD",
          balance: 0.0, // Start with zero balance
        },
      })

      return newUser
    })

    const { password: _, ...userWithoutPassword } = user

    // 🔁 Optionally: include the wallet in the response
    const wallet = await prisma.wallet.findFirst({
      where: { userId: user.id, currency: "USD" },
    })

    // Format before sending
    const formattedWallet = {
      ...wallet,
      balance: formatBalance(wallet.balance, "USD"),
    }

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
      wallet: formattedWallet,
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // ✅ Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Don't issue JWT yet
      return res.json({
        requires2FA: true,
        tempToken: jwt.sign(
          { userId: user.id, email: user.email, requires2FA: true },
          JWT_SECRET,
          { expiresIn: "5m" } // Short-lived
        ),
      })
    }

    //  2FA not enabled → issue full JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    })

    const { password: _, ...userWithoutPassword } = user
    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
