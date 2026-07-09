const express = require("express")
const router = express.Router()
const oAuthGoogleController = require("../controllers/oAuthGoogle.controller")

// Abrimos Login de Google
router.get("/", oAuthGoogleController.passportAuthenticate)

// Respuesta Google
router.get("/callback", oAuthGoogleController.passportCallback)

// Cuando el Login de Google da OK
router.get("/protected", oAuthGoogleController.passportSuccess)

// Cuando el Login de Google Fracasa
router.get("/failure", oAuthGoogleController.passportFailure)

// Cuando hacemos el Logout de Google
router.post("/logout", oAuthGoogleController.passportLogout)

module.exports = router