const express = require("express")
const paymentController = require("../controllers/payment.controller")
const jwtMW = require("../middlewares/jwt.mw")

const router = express.Router()

router.post('/create-checkout-session', jwtMW.authenticate, paymentController.createCheckoutSession)

module.exports = router