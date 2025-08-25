const express = require("express")
const {
  createCard,
  getCards,
  freezeCard,
  unfreezeCard,
} = require("../controllers/cardController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/", authenticate, createCard) // POST /api/cards
router.get("/", authenticate, getCards) // GET /api/cards
router.post("/:cardId/freeze", authenticate, freezeCard) // POST /api/cards/:cardId/freeze
router.post("/:cardId/unfreeze", authenticate, unfreezeCard) // POST /api/cards/:cardId/unfreeze

module.exports = router
