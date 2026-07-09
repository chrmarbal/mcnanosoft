const ratingsController = require("../controllers/ratings.controller")
const express = require("express")
const router = express.Router()
const jwtMW = require("../middlewares/jwt.mw")
const rutasProtegidasMW = require("../middlewares/rutasProtegidas.mw")

// FIND ALL
router.get("/", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, ratingsController.findAllRatings)

// CREATE RATING
router.post("/", jwtMW.authenticate, ratingsController.createRating)

// CHANGE APROVED
router.patch("/:id",  jwtMW.authenticate, rutasProtegidasMW.requireAdmin, ratingsController.changeAproved)

// FIND BY ID USER
router.get("/user/:id", jwtMW.authenticate, ratingsController.findRatingByIdUser)

// FIND BY ID PROJECT
router.get("/project/:id", ratingsController.findRatingByIdProject)

// FIND BY ID
router.get("/:id", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, ratingsController.findRatingById)

// Exportamos las rutas
module.exports = router