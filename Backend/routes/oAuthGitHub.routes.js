const express = require("express")
const router = express.Router()
const oAuthGitHubController = require("../controllers/oAuthGitHub.controller")

// Abrimos Login de Google
router.get("/", oAuthGitHubController.passportAuthenticate)

// Procesa el perfil recibido y establece la cookie de autenticación
router.get("/callback", oAuthGitHubController.passportCallback, oAuthGitHubController.passportSuccess)

// Cuando el Login de Google Fracasa
router.get("/failure", oAuthGitHubController.passportFailure)

// Cuando hacemos el Logout de Google
router.post("/logout", oAuthGitHubController.passportLogout)

module.exports = router