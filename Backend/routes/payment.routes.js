const express = require("express")
const paymentController = require("../controllers/payment.controller")

const router = express.Router()

router.post('/create-checkout-session', paymentController.createCheckoutSession)

module.exports = router