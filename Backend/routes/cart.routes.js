const cartController = require("../controllers/cart.controller")
const express = require("express")
const router = express.Router()

router.get("/", cartController.getCart)
router.get("/add/:id", cartController.addItemToCart)
router.get("/remove/:id", cartController.deleteItemFromCart)
router.get("/clearCart", cartController.clearCart)

module.exports = router