const usersController = require("../controllers/users.controller")
const express = require("express")
const router = express.Router()
const jwtMW = require("../middlewares/jwt.mw")
const rutasProtegidasMW = require("../middlewares/rutasProtegidas.mw")
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

// FIND ALL USERS
router.get("/", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, usersController.findAllUsers)

// CREATE USER / REGISTER
router.post("/", upload.single("profilePicture"), usersController.register)

// REVIVE USER BY ID
router.patch("/revive/:id", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, usersController.reviveUser)

// UPDATE USER BY ID
router.patch("/edit/:id", jwtMW.authenticate, upload.single("profilePicture"), usersController.updateUserByID)

// DELETE USER BY ID
router.delete("/:id", jwtMW.authenticate, usersController.deleteUserByID)

// LOGIN
router.post("/login", usersController.login)

// GET SESSION
router.get("/session", usersController.getSession)

// LOGOUT
router.get("/logout", jwtMW.authenticate, usersController.logout)

// RECOVER ACCOUNT
router.post("/recovery", usersController.recoverAccount)

// RESET ACCOUNT
router.patch("/resetAccount/:email", usersController.resetAccount)

// FIND USER BY ID
router.get("/:id", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, usersController.findUserByID)

module.exports = router