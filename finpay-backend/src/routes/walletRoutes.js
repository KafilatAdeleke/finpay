const express = require("express")
const {
  createWallet,
  getWallets,
  getWalletByCurrency,
} = require("../controllers/walletController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", authenticate, getWallets) // GET /api/wallets
router.post("/", authenticate, createWallet) // POST /api/wallets
router.get("/:currency", authenticate, getWalletByCurrency) // GET /api/wallets/usd

module.exports = router
