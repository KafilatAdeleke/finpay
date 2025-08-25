const express = require("express")
const {
  createInvoice,
  getInvoices,
  payInvoice,
} = require("../controllers/invoiceController")
const { authenticate } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/", authenticate, createInvoice) // POST /api/invoices
router.get("/", authenticate, getInvoices) // GET /api/invoices
router.get("/pay/:paymentLink", payInvoice) // GET /pay/inv_abc123 (public)

module.exports = router
