// src/routes/userRoutes.js
const express = require("express")
const { getProfile } = require("../controllers/userController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

// Protect this route: only accessible with valid JWT
router.get("/me", authenticate, getProfile)

module.exports = router
