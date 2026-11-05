require("dotenv").config()
const projectsModel = require("../models/projects.model")
const usersModel = require("../models/users.model")
const AppError = require("../utils/AppError")
const { google } = require("googleapis")
const { Readable } = require("stream")
const path = require("path")
const cloudinaryImages = require("../utils/cloudinary")

const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"

// Función Para Capturar Errores Asíncronos
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => {
            next(e)
        })
    }
}

// Solo Para Producción
let credentialsConfig
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    credentialsConfig = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf-8"))
}

// #region CRUD PROJECTS
// <============ CRUD PROJECTS ============>

// FIND ALL
exports.findAllProjects = wrapAsync(async (req, res, next) => {
    try {
        const datosProjects = await projectsModel.findAll()
        res.status(200).json(datosProjects)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// FIND PROJECTS FOR LIBRARY
exports.getLibrary = wrapAsync(async (req, res, next) => {
    const projects = await projectsModel.find({})
    if(projects){
        res.status(200).json(projects)
    } else{
        next(new AppError("Sin resultados", 404))
    }
})

// CREATE PROJECT
exports.createProject = wrapAsync(async (req, res, next) => {
    const { name, description, price, size, technology } = JSON.parse(req.body.project)
    const icon = req.files?.["icon"]?.[0]
    const thumbnail = req.files?.["thumbnail"]?.[0]
    const projectSource = req.files?.["source"]?.[0]

    if (!icon || !thumbnail || !projectSource) {
        throw new AppError("El logo, la portada y el código fuente son obligatorios", 400)
    }

    const { projectIcon, thumbnail: thumbnailUrl } = await uploadProjectImages(name, {
        icon,
        thumbnail
    })

    let projectUrl = await uploadToGoogleDrive(projectSource, name)

    const numericPrice = Number(price)
    const projectPrice = String(price).toUpperCase() === "FREE" || numericPrice === 0
        ? "FREE"
        : `${numericPrice.toFixed(2)}€`

    const newProject = {
        name: name,
        description: description,
        price: projectPrice,
        size: size,
        projectIcon: projectIcon,
        projectUrl: projectUrl,
        technology: technology,
        thumbnail: thumbnailUrl,
        openSource: projectPrice === "FREE",
        purchases: 0,
        deleted: false
    }

    try {
        const datosProyectoCreado = await projectsModel.createProject(newProject)
        const adminUser = await usersModel.findOne({profile: "Administrador"})
        req.userLogued.data = adminUser
        res.status(200).json({proyectData: datosProyectoCreado, adminData: adminUser})
    } catch (err) {
        next(new AppError(err.message || err, 400))
    }
})

// FIND BY ID
exports.findProjectByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    try {
        const datosProject = await projectsModel.findProjectById(id)
        res.status(200).json(datosProject)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// UPDATE BY ID
exports.updateProjectByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { name, description, price, size = null, deleted = false} = JSON.parse(req.body.project)
    const existingProject = await projectsModel.findById(id)
    if (!existingProject) {
        throw new AppError("No se ha encontrado el Proyecto", 404)
    }
    if (name !== existingProject.name && await projectsModel.findOne({ name, _id: { $ne: id } })) {
        throw new AppError("Ya existe un proyecto con ese nombre", 400)
    }

    const numericPrice = Number(price)
    const projectPrice = String(price).toUpperCase() === "FREE" || numericPrice === 0
        ? "FREE"
        : `${numericPrice.toFixed(2)}€`

    const updatedProject = {
        name: name,
        description: description,
        price: projectPrice,
        openSource: projectPrice === "FREE",
        deleted: deleted
    }

    if(size){
        updatedProject.size = size
    }

    const icon = req.files?.["icon"]?.[0]
    const thumbnail = req.files?.["thumbnail"]?.[0]
    if (icon || thumbnail || existingProject.name !== name) {
        const imageUrls = await uploadProjectImages(name, {
            icon,
            thumbnail
        }, existingProject)
        if (imageUrls.projectIcon) {
            updatedProject.projectIcon = imageUrls.projectIcon
        }
        if (imageUrls.thumbnail) {
            updatedProject.thumbnail = imageUrls.thumbnail
        }
    }

    if(req.files){
        if(req.files["source"]?.[0]){
            const projectSource = req.files["source"]?.[0]
    
            let projectUrl = await uploadToGoogleDrive(projectSource, name)
    
            updatedProject.projectUrl = projectUrl
        }
    }

    try {
        const datosUsuarioActualizado = await projectsModel.updateProjectById(id, updatedProject)
        res.status(200).json(datosUsuarioActualizado)
    } catch (err) {
        next(new AppError(err.message || err, 400))
    }
})

// DELETE BY ID
exports.deleteProjectByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params

    let datosProyectoEliminado
    try {
        datosProyectoEliminado = await projectsModel.deleteProjectById(id)
    } catch (err) {
        return next(new AppError(err.message || err, 404))
    }

    await Promise.all([
        cloudinaryImages.deleteImage(datosProyectoEliminado.projectIcon),
        cloudinaryImages.deleteImage(datosProyectoEliminado.thumbnail)
    ])
    res.status(200).json(datosProyectoEliminado)
})

// DOWNLOAD PROJECT
exports.downloadProject = wrapAsync(async(req, res, next) => {
    const { projectUrl } = req.params

    const auth = new google.auth.GoogleAuth({
        ...(credentialsConfig
            ? { credentials: credentialsConfig }
            : { keyFile: path.join(__dirname, "../private/mcnanosoft-6386bcc17091.json") }
        ),
        scopes: [GOOGLE_DRIVE_SCOPE],
    })

    try {
        const authClient = await auth.getClient()
        const drive = google.drive({ version: "v3", auth: authClient })

        // Obtenemos la metadata del archivo (nombre y mimeType)
        const metadataResponse = await drive.files.get({
        fileId: projectUrl,
        fields: "name, mimeType",
        })
        const fileName = metadataResponse.data.name
        const mimeType = metadataResponse.data.mimeType || "application/octet-stream"

        // Configuramos los headers para forzar la descarga en el navegador
        res.setHeader("Content-Disposition", `attachment filename="${fileName}"`)
        res.setHeader("Content-Type", mimeType)

        // Obtenemos el stream del archivo con alt: 'media'
        const driveResponse = await drive.files.get(
        { fileId: projectUrl, alt: "media" },
        { responseType: "stream" }
        )

        // Pipeamos el contenido descargado directamente a la respuesta,
        // de esta forma se envía el contenido al frontend para descargar.
        driveResponse.data
        .on("error", (err) => {
            console.error("Error en el streaming del archivo:", err)
            next(new AppError("No se pudo descargar el archivo", 500))
        })
        .pipe(res)
        .on("finish", () =>
            console.log(`Archivo ${fileName} enviado al cliente correctamente.`)
        )
    } catch (error) {
        console.error(error.message)
        next(new AppError("No se pudo descargar el archivo", 500))
    }

})

async function createDriveClient() {
    const auth = new google.auth.GoogleAuth({
        ...(credentialsConfig
            ? { credentials: credentialsConfig }
            : { keyFile: path.join(__dirname, "../private/mcnanosoft-6386bcc17091.json") }
        ),
        scopes: [GOOGLE_DRIVE_SCOPE],
    })

    const authClient = await auth.getClient()
    return google.drive({ version: "v3", auth: authClient })
}

function escapeDriveQueryValue(value) {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

async function uploadProjectImages(name, images, existingProject) {
    let projectFolder
    try {
        projectFolder = `mcnanosoft/projects/${cloudinaryImages.normalizeProjectFolderName(name)}`
    } catch (error) {
        throw new AppError(error.message, 400)
    }

    const imageUrls = {}
    const projectImages = [
        { key: "icon", property: "projectIcon", publicId: "logo" },
        { key: "thumbnail", property: "thumbnail", publicId: "thumbnail" }
    ]

    for (const projectImage of projectImages) {
        const previousUrl = existingProject?.[projectImage.property]
        let result

        if (images[projectImage.key]) {
            result = await cloudinaryImages.replaceImage(
                images[projectImage.key].buffer,
                previousUrl,
                projectFolder,
                projectImage.publicId
            )
        } else if (existingProject && existingProject.name !== name) {
            result = await cloudinaryImages.moveImage(
                previousUrl,
                projectFolder,
                projectImage.publicId
            )
        }

        if (result?.secure_url) {
            imageUrls[projectImage.property] = result.secure_url
        }
    }

    return imageUrls
}

// UPLOAD TO GOOGLE DRIVE
async function uploadToGoogleDrive(projectSource, name) {
    try {
        const zipBuffer = projectSource.buffer
        const projectName = name

        const drive = await createDriveClient()

        const sharedFolderId = "1MLR5PkMOsRLRglQ7ym7r3lo3jEQWLjVy"
        const escapedProjectName = escapeDriveQueryValue(projectName)

        // 1. Buscar si ya existe una carpeta con ese nombre en la carpeta padre
        const { data: list } = await drive.files.list({
            q: `'${sharedFolderId}' in parents and name='${escapedProjectName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id, name)",
        })

        let folderId

        if (list.files.length > 0) {
            // Carpeta ya existe
            folderId = list.files[0].id

            // Opcional: eliminar archivos anteriores
            const { data: existingFiles } = await drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: "files(id)",
            })

            for (const file of existingFiles.files) {
                await drive.files.delete({ fileId: file.id })
            }
        } else {
            // 2. Crear nueva carpeta
            const { data: folder } = await drive.files.create({
                requestBody: {
                    name: projectName,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [sharedFolderId],
                },
                fields: "id",
            })

            folderId = folder.id
        }

        // 3. Subir el nuevo archivo ZIP
        const { data: file } = await drive.files.create({
            requestBody: {
                name: "project.zip",
                parents: [folderId],
            },
            media: {
                body: Readable.from(zipBuffer),
            },
        })

        return file.id
    } catch (err) {
        console.error(err)
        throw err
    }
}