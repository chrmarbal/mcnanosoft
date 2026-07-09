const purchasesController = require("../controllers/purchases.controller")
const express = require("express")
const router = express.Router()

// FIND ALL
router.get("/", purchasesController.findAllPurchases)

// CREATE PURCHASE
router.post("/", purchasesController.createPurchase)

// UPDATE PURCHASE
router.patch("/edit/:id", purchasesController.updateStateById)

// FIND PURCHASE BY ID
router.get("/:id", purchasesController.findPurchaseById)

// FIND PURCHASE BY ID USER
router.get("/user/:idUser", purchasesController.findPurchaseByIdUser)

module.exports = router