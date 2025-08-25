const Redis = require("ioredis")
require("dotenv").config()

let client

try {
  client = new Redis(process.env.REDIS_URL)

  client.on("connect", () => {
    console.log("✅ Connected to Redis Cloud")
  })

  client.on("error", (err) => {
    console.error("❌ Redis Error:", err.message)
  })

  client.on("end", () => {
    console.log(".Redis connection closed")
  })
} catch (err) {
  console.error("Failed to create Redis client:", err.message)
}

module.exports = client
