const express = require("express")
const {
  setup2FA,
  verify2FA,
  disable2FA,
} = require("../controllers/twoFactorController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/setup", authenticate, setup2FA)
router.post("/verify", authenticate, verify2FA)
router.post("/disable", authenticate, disable2FA)

module.exports = router
