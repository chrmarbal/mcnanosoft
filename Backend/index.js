require("dotenv").config()
const fs = require("fs")
const https = require("https")
const session = require("express-session") // npm i express-session
const methodOverride = require("method-override") // npm i method-override
const express = require("express") // npm i express
const app = express()
const port = process.env.PORT || process.env.PUERTO
const path = require("path") // npm i path
const cors = require("cors") // nmp i cors
const mongoDBConfig = require("./utils/mongodb.config")
const usersRoutes = require("./routes/users.routes")
const projectsRoutes = require("./routes/projects.routes")
const purchasesRoutes = require("./routes/purchases.routes")
const cartRoutes = require("./routes/cart.routes")
const paymentRoutes = require("./routes/payment.routes")
const ratingsRoutes = require("./routes/ratings.routes")
const oAuthGoogleRoutes = require("./routes/oAuthGoogle.routes")
const oAuthGitHubRoutes = require("./routes/oAuthGitHub.routes")
const logger = require("./utils/logger")
const AppError = require("./utils/AppError")
const errorHandlerMW = require("./middlewares/errorHandler.mw")
const morganMW = require("./middlewares/morgan.mw")

// <============ CONFIGURACIÓN HTTPS ============>
let certificate = null
let certificate_key = null
let https_server = false
try {
    certificate = fs.readFileSync("certs/cert.crt")
    certificate_key = fs.readFileSync("certs/private.key")
    https_server = true
} catch (error) {
    console.log(error)
}

// CONFIGURACIÓN CORS
const whiteList = ["http://localhost:5173", "https://localhost:5173", "https://mcnanosoft.vercel.app"]
const corsOptions = {
    origin: (origin, callback) => {
        if(whiteList.includes(origin) || !origin){
            if(origin){
                console.log("Acceso desde: " + origin)
                logger.access.info("Acceso Desde: " + origin)
            }
            callback(null, true)
        } else{
            callback(new AppError("Url de origen Bloqueada. URL: " + origin), 403)
        }
    },
    credentials: true
}
app.use(cors(corsOptions))

// COOKIE DE SESIÓN
app.use(session({
    name: "mcnanosoft",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: https_server,
        httpOnly: true,
        maxAge: 172800000, // 2 Días
        sameSite: "none"
    }
}))

// CONFIGURACIÓN SERVIDOR
app.use(express.urlencoded({extended: true})) // Leer Datos req.body
app.use(express.json()) // Leer Datos JSON en req.body
app.use(methodOverride("_method")) // Para Poder hacer Patch y Delete
app.use(express.static(path.join(__dirname, "public"))) // Asignamos la carpeta "public" como la carpeta de contenido estático (imágenes, css, etc.)
app.use(morganMW.usingMorgan()) // Usamos la configuración de Morgan para añadir los logs de acceso al API

// MIDDLEWARE DE CONEXIÓN SERVERLESS
app.use(async (req, res, next) => {
    try {
        await mongoDBConfig.conectarMongoDB()
        next()
    } catch (err) {
        console.error("Error crítico de conexión a MongoDB en middleware:", err)
        next(new AppError("Error de conexión con la base de datos", 500))
    }
})

// RUTAS
app.use(`/api/${process.env.API_VERSION}/users`, usersRoutes)
app.use(`/api/${process.env.API_VERSION}/projects`, projectsRoutes)
app.use(`/api/${process.env.API_VERSION}/purchases`, purchasesRoutes)
app.use(`/api/${process.env.API_VERSION}/cart`, cartRoutes)
app.use(`/api/${process.env.API_VERSION}/payment`, paymentRoutes)
app.use(`/api/${process.env.API_VERSION}/ratings`, ratingsRoutes)
app.use("/auth/google", oAuthGoogleRoutes)
app.use("/auth/github", oAuthGitHubRoutes)

// RUTAS INEXISTENTES
app.use((req, res) => {
    logger.error.fatal("Ruta no existente " + req.originalUrl)   
    throw new AppError("Ruta no existente", 404)
})

// MANEJADOR DE ERRORES
app.use(errorHandlerMW.errorHandler)

// LEVANTAR EL SERVIDOR

if(https_server){
    // HTTPS
    https.createServer({
        key: certificate_key,
        cert: certificate
    }, app).listen(port, async ()=>{
        console.log("RUTA BASE: ")
        console.log(`https://localhost:${port}`)

        console.log()

        console.log("<============ USERS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/users`)

        console.log()

        console.log("<============ PROJECTS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/projects`)

        console.log()


        console.log("<============ RATINGS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/ratings`)

        console.log()

        // Conectar Con MongoDB
        try {
            await mongoDBConfig.conectarMongoDB()
            .then(()=>{
                console.log("Conectado con MongoDB!!!")
            })
            .catch((err)=>{
                console.log(`Error al conectar con MongoDB. Desc: ${err}`)
                process.exit(0)
            })
        } catch (error) {
            console.log(`Error en el server. Desc: ${error}`)
            process.exit(0)
        }
    })
} else{
    // https
    app.listen(port, async () => {
        console.log("RUTA BASE: ")
        console.log(`https://localhost:${port}`)
    
        console.log()
    
        console.log("<============ USERS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/users`)
    
        console.log()
    
        console.log("<============ PROJECTS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/projects`)
    
        console.log()


        console.log("<============ RATINGS ============>")
        console.log(`https://localhost:${port}/api/${process.env.API_VERSION}/ratings`)

        console.log()
    
        // Conectar Con MongoDB
        try {
            await mongoDBConfig.conectarMongoDB()
            .then(()=>{
                console.log("Conectado con MongoDB!!!")
            })
            .catch((err)=>{
                console.log(`Error al conectar con MongoDB. Desc: ${err}`)
                process.exit(0)
            })
        } catch (error) {
            console.log(`Error en el server. Desc: ${error}`)
            process.exit(0)
        }
    })
}

// Exportamos la app para Vercel
module.exports = app