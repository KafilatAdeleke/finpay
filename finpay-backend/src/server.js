const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const walletRoutes = require("./routes/walletRoutes")
const transactionRoutes = require("./routes/transactionRoutes")
const cardRoutes = require("./routes/cardRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const twoFactorRoutes = require("./routes/twoFactorRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/wallets", walletRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/cards", cardRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/2fa", twoFactorRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FinPay Backend is running!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
