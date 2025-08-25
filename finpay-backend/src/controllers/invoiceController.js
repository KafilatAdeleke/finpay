const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Generate a short, unique payment link ID
const generatePaymentLinkId = () => {
  return "inv_" + Math.random().toString(36).substr(2, 9)
}

// Create invoice
exports.createInvoice = async (req, res) => {
  const {
    customerName,
    customerEmail,
    currency,
    amount,
    description,
    dueDate,
  } = req.body
  const { userId } = req.user

  if (!customerName || !customerEmail || !amount) {
    return res
      .status(400)
      .json({ error: "Customer name, email, and amount are required" })
  }

  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Valid positive amount is required" })
  }

  try {
    const paymentLink = generatePaymentLinkId()

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        customerName,
        customerEmail,
        currency: currency?.toUpperCase() || "USD",
        amount: numericAmount,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "sent",
        paymentLink,
      },
    })

    res.status(201).json({
      message: "Invoice created and sent!",
      invoice: {
        ...invoice,
        paymentUrl: `http://localhost:5000/pay/${paymentLink}`,
      },
    })
  } catch (error) {
    console.error("Create invoice error:", error)
    res.status(500).json({ error: "Failed to create invoice" })
  }
}

// Get all invoices (with filtering)
exports.getInvoices = async (req, res) => {
  const { userId } = req.user
  const { status, customerEmail } = req.query

  const filter = { userId }

  if (status) filter.status = status
  if (customerEmail) filter.customerEmail = customerEmail

  try {
    const invoices = await prisma.invoice.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
    })

    res.json({ invoices })
  } catch (error) {
    console.error("Get invoices error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

// Pay invoice (public route — no auth)
exports.payInvoice = async (req, res) => {
  const { paymentLink } = req.params

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { paymentLink },
    })

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ error: "Invoice already paid" })
    }

    // For now: simulate payment
    const updated = await prisma.invoice.update({
      where: { paymentLink },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    })

    res.json({
      message: "Payment successful!",
      invoice: updated,
    })
  } catch (error) {
    console.error("Pay invoice error:", error)
    res.status(500).json({ error: "Payment failed" })
  }
}
