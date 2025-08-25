const express = require("express")
const {
  internalTransfer,
  sendPayment,
  getTransactions,
} = require("../controllers/transactionController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

// 🔁 Internal wallet-to-wallet transfer
router.post("/transfer", authenticate, internalTransfer)

// 🌐 Send money to another user
router.post("/send", authenticate, sendPayment)

// 📊 Get transaction history (with filtering)
router.get("/", authenticate, getTransactions)

module.exports = router
