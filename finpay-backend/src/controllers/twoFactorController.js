// src/controllers/twoFactorController.js
const { PrismaClient } = require("@prisma/client")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")
const prisma = new PrismaClient()

// 🌐 Generate TOTP secret and QR code
exports.setup2FA = async (req, res) => {
  const { userId } = req.user

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // 2. Generate secret (only if not already set)
    let secret
    if (user.twoFactorSecret) {
      secret = speakeasy.generateSecret({ ascii: user.twoFactorSecret })
    } else {
      secret = speakeasy.generateSecret({
        name: `FinPay (${user.email})`,
        issuer: "FinPay",
      })

      // Save base32 secret to DB
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret.ascii },
      })
    }

    // 3. Generate QR code URL
    const qrUrl = secret.otpauth_url

    // 4. Convert to image data URL
    const qrCodeDataUrl = await qrcode.toDataURL(qrUrl)

    res.json({
      message: "Scan this QR code with Google Authenticator",
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    })
  } catch (error) {
    console.error("Setup 2FA error:", error)
    res.status(500).json({ error: "Failed to set up 2FA" })
  }
}

// ✅ Verify 2FA code and enable 2FA
exports.verify2FA = async (req, res) => {
  const { token } = req.body
  const { userId } = req.user

  if (!token) {
    return res.status(400).json({ error: "Token is required" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not set up" })
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "ascii",
      token: token,
      window: 1, // Allow 1 time step before/after
    })

    if (!verified) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    })

    res.json({
      message: "2FA enabled successfully!",
    })
  } catch (error) {
    console.error("Verify 2FA error:", error)
    res.status(500).json({ error: "Verification failed" })
  }
}

// 🔌 Disable 2FA
exports.disable2FA = async (req, res) => {
  const { token } = req.body
  const { userId } = req.user

  if (!token) {
    return res.status(400).json({ error: "Token is required to disable 2FA" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" })
    }

    // Verify token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "ascii",
      token: token,
      window: 1,
    })

    if (!verified) {
      return res.status(400).json({ error: "Invalid token" })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        // Optionally: clear secret
        // twoFactorSecret: null
      },
    })

    res.json({ message: "2FA disabled successfully" })
  } catch (error) {
    console.error("Disable 2FA error:", error)
    res.status(500).json({ error: "Failed to disable 2FA" })
  }
}

// Verify 2FA during login
exports.verifyLogin2FA = async (req, res) => {
  const { token: totpToken } = req.body
  const { tempToken } = req.body // From login response

  if (!totpToken || !tempToken) {
    return res
      .status(400)
      .json({ error: "TOTP token and tempToken are required" })
  }

  try {
    // Verify the temporary JWT (contains userId)
    const decoded = jwt.verify(tempToken, JWT_SECRET)
    if (!decoded.requires2FA) {
      return res.status(400).json({ error: "Invalid temp token" })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "User or 2FA setup not found" })
    }

    // Verify TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      token: totpToken,
      encoding: "ascii",
      window: 1,
    })

    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired 2FA code" })
    }

    // ✅ All good — issue final JWT
    const finalToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    const { password: _, ...userWithoutPassword } = user
    res.json({
      message: "Login successful",
      token: finalToken,
      user: userWithoutPassword,
    })
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid or expired temp token" })
    }
    console.error("2FA login verify error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
