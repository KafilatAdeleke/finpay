const jwt = require("jsonwebtoken")
require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET

const authenticate = (req, res, next) => {
  // Get token from header: "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // "Bearer TOKEN" → extract TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." })
  }
}

module.exports = { authenticate }
