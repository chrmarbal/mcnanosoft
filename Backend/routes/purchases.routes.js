const purchasesController = require("../controllers/purchases.controller")
const express = require("express")
const router = express.Router()
const jwtMW = require("../middlewares/jwt.mw")
const protectedRoutes = require("../middlewares/rutasProtegidas.mw")

// FIND ALL
router.get("/", jwtMW.authenticate, protectedRoutes.requireAdmin, purchasesController.findAllPurchases)

// CREATE PURCHASE
router.post("/", jwtMW.authenticate, purchasesController.createPurchase)

// UPDATE PURCHASE
router.patch("/edit/:id", jwtMW.authenticate, purchasesController.updateStateById)

// FIND PURCHASE BY ID
router.get("/:id", jwtMW.authenticate, purchasesController.findPurchaseById)

// FIND PURCHASE BY ID USER
router.get("/user/:idUser", jwtMW.authenticate, purchasesController.findPurchaseByIdUser)

module.exports = router