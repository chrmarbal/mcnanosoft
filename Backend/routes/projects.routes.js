const projectsController = require("../controllers/projects.controller")
const express = require("express")
const router = express.Router()
const multer = require("multer")
const jwtMW = require("../middlewares/jwt.mw")
const rutasProtegidasMW = require("../middlewares/rutasProtegidas.mw")

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

// FIND ALL
router.get("/", projectsController.findAllProjects)

// GET LIBRARY PROJECTS
router.get("/library", jwtMW.authenticate, projectsController.getLibrary)

// CREATE PROJECT
router.post("/", upload.fields([ { name: "icon", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }, { name: "source", maxCount: 1 } ]), jwtMW.authenticate, rutasProtegidasMW.requireAdmin, projectsController.createProject)

// UPDATE PROJECT
router.patch("/edit/:id", upload.fields([ { name: "icon", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }, { name: "source", maxCount: 1 } ]), jwtMW.authenticate, rutasProtegidasMW.requireAdmin, projectsController.updateProjectByID)

// DELETE PROJECT
router.delete("/:id", jwtMW.authenticate, rutasProtegidasMW.requireAdmin, projectsController.deleteProjectByID)

// DOWNLOAD PROJECT
router.get("/download/:projectUrl", jwtMW.authenticate, projectsController.downloadProject)

// FIND PROJECT BY ID
router.get("/:id", projectsController.findProjectByID)

module.exports = router