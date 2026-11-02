require("dotenv").config()
const usersModel = require("../models/users.model")
const AppError = require("../utils/AppError")
const bcrypt = require("../utils/bcrypt")
const jwtMW = require("../middlewares/jwt.mw")
const { promisify } = require("util")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const cloudinaryImages = require("../utils/cloudinary")
const { isValidUsername } = require("../utils/usernames")

let tokenCookie = {}

// Función Para Capturar Errores Asíncronos
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => {
            next(e)
        })
    }
}

// #region CRUD USERS
// <============ CRUD USERS ============>

// FIND ALL
exports.findAllUsers = wrapAsync(async (req, res, next) => {
    try {
        const datosUsers = await usersModel.findAll()
        res.status(200).json(datosUsers)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// CREATE USER / REGISTER
exports.register = wrapAsync(async (req, res, next) => {
    const { username, password, firstName, lastName, email } = JSON.parse(req.body.user)
    const profilePicture = req.file

    if (!isValidUsername(username)) {
        throw new AppError("El nombre de usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo; debe empezar y terminar con una letra o número", 400)
    }

    if(req.session.userLogued && req.session.userLogued.data.profile != "Administrador"){
        next(new AppError("No estás autorizado", 403))
    } else{
        if(password.length < 8){
            next(new AppError("Aumenta la longitud de la contraseña en 8 caracteres como mínimo",400))
        }else if(!password.match(/[A-Z]/)){
           next(new AppError("La contraseña debe tener al menos una mayúscula",400))
        }else if(!password.match(/[a-z]/)){
           next(new AppError("La contraseña debe tener al menos una minúscula",400))
        }else if(!password.match(/[/\d/]/)){
           next(new AppError("La contraseña debe tener al menos un número",400))
        }else if(!password.match(/^(?=.*[!@#$%^&*(),.?":{}|<>_=+-])/)){
           next(new AppError("La contraseña debe tener al menos un carácter especial",400))
        } else{
            const allUsers = await usersModel.find({profile: "Usuario"})

            let validado = true
            let errorMessage = ""
            for (let user of allUsers) {
                if(user.email == email){
                    errorMessage = "El Correo Electrónico introducido ya está vinculado a una cuenta"
                    validado = false
                    break
                } else if(user.username == username){
                    errorMessage = "El Nombre de Usuario introducido ya está vinculado a una cuenta"
                    validado = false
                    break
                }
            }


            if(validado){
                const newUser = {
                username: username,
                password: password,
                firstName: firstName,
                lastName: lastName,
                email: email,
                library: [],
                profile: "Usuario",
                active: true,
                created_at: new Date()
                }

                if(profilePicture){
                    const folder = "mcnanosoft/users"
                    const uploadedImage = await cloudinaryImages.replaceImage(
                        profilePicture.buffer,
                        null,
                        folder,
                        username
                    )
                    newUser.profilePicture = uploadedImage.secure_url
                }

                // CIFRAR CONTRASEÑA
                newUser.password = await bcrypt.hashPassword(newUser.password)

                console.log(newUser)
                try {
                    const datosUsuarioCreado = await usersModel.createUser(newUser)
                    if(!req.session.userLogued){
                        const jwtToken = jwtMW.createJWT(req, res, next, datosUsuarioCreado)
                        const userLogued = {
                            data: datosUsuarioCreado,
                            token: jwtToken
                        }

                        req.session.userLogued = userLogued
                    }

                    res.status(200).json(datosUsuarioCreado)
                } catch (err) {
                    next(new AppError(err.message || err, 400))
                }
            } else{
                next(new AppError(errorMessage, 400))
            }            
        }
    }
})

// FIND BY ID
exports.findUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    try {
        const datosUser = await usersModel.findUserById(id)
        res.status(200).json(datosUser)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// UPDATE BY ID
exports.updateUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const {
        username,
        firstName,
        lastName,
        email,
        currentPassword = "",
        newPassword = ""
    } = JSON.parse(req.body.user)
    const profilePicture = req.file
    const userLogued = req.session.userLogued?.data

    if (String(userLogued?._id) !== id) {
        throw new AppError("No estás autorizado", 403)
    }

    const user = await usersModel.findById(id)
    if (!user) {
        throw new AppError("No se ha encontrado el Usuario", 404)
    }

    const updatedUser = {}
    if (username !== undefined && username !== "") {
        if (!isValidUsername(username)) {
            throw new AppError("El nombre de usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo; debe empezar y terminar con una letra o número", 400)
        }
        if (username !== user.username) {
            const usernameInUse = await usersModel.findOne({ username, _id: { $ne: id } })
            if (usernameInUse) {
                throw new AppError("El Nombre de Usuario introducido ya está vinculado a una cuenta", 400)
            }
        }
        updatedUser.username = username
    }
    if (firstName) updatedUser.firstName = firstName
    if (lastName) updatedUser.lastName = lastName
    if (email) updatedUser.email = email

    if (currentPassword || newPassword) {
        if (!currentPassword) {
            throw new AppError("La contraseña actual es requerida", 400)
        }
        if (!newPassword) {
            throw new AppError("La nueva contraseña es requerida", 400)
        }
        if (!(await bcrypt.compareLogin(currentPassword, user.password))) {
            throw new AppError("La contraseña actual es incorrecta", 400)
        }
        if (newPassword.length < 8) {
            throw new AppError("Aumenta la longitud de la contraseña en 8 caracteres como mínimo", 400)
        }
        if (!/[A-Z]/.test(newPassword)) {
            throw new AppError("La contraseña debe tener al menos una mayúscula", 400)
        }
        if (!/[a-z]/.test(newPassword)) {
            throw new AppError("La contraseña debe tener al menos una minúscula", 400)
        }
        if (!/\d/.test(newPassword)) {
            throw new AppError("La contraseña debe tener al menos un número", 400)
        }
        if (!/[!@#$%^&*(),.?":{}|<>_=+-]/.test(newPassword)) {
            throw new AppError("La contraseña debe tener al menos un carácter especial", 400)
        }
        if (newPassword === currentPassword) {
            throw new AppError("La nueva contraseña debe ser distinta a la actual", 400)
        }
        updatedUser.password = await bcrypt.hashPassword(newPassword)
    }

    const updatedUsername = updatedUser.username || user.username
    const userFolder = "mcnanosoft/users"
    if (profilePicture) {
        const uploadedImage = await cloudinaryImages.replaceImage(
            profilePicture.buffer,
            user.profilePicture,
            userFolder,
            updatedUsername
        )
        updatedUser.profilePicture = uploadedImage.secure_url
    } else if (updatedUsername !== user.username && user.profilePicture) {
        const movedImage = await cloudinaryImages.moveImage(
            user.profilePicture,
            userFolder,
            updatedUsername
        )
        if (movedImage?.secure_url) {
            updatedUser.profilePicture = movedImage.secure_url
        }
    }

    try {
        const datosUsuarioActualizado = await usersModel.updateUserById(id, updatedUser)
        req.session.userLogued.data = datosUsuarioActualizado
        res.status(200).json(datosUsuarioActualizado)
    } catch (err) {
        next(new AppError(err.message || err, 400))
    }
})

// DELETE BY ID
exports.deleteUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params

    const userLogued = req.session.userLogued.data

    if(userLogued._id != id && userLogued.profile != "Administrador"){
        next(new AppError("No estás autorizado", 403))
    } else{
        try {
            const datosUsuarioEliminado = await usersModel.deleteUserById(id)
            if(userLogued._id == id){
                return exports.logout(req, res, next)
            }
            res.status(200).json(datosUsuarioEliminado)
        } catch (err) {
            next(new AppError(err.message || err, 404))
        }
    }
})

// #region LOGIN/LOGOUT
// <============ LOGIN/LOGOUT ============>

// LOGIN
exports.login = wrapAsync(async (req, res, next) => {
    const { username, password } = req.body

    if (!isValidUsername(username)) {
        throw new AppError("El nombre de usuario debe tener entre 3 y 30 caracteres válidos", 400)
    }

    if(req.session.userLogued){
        next(new AppError("Ya estás Logueado", 400))
    } else{
        try {
            const userFounded = await usersModel.findUserByUsername(username)
            const validado = await bcrypt.compareLogin(password, userFounded.password)
            if(validado){
                const jwtToken = jwtMW.createJWT(req, res, next, userFounded)
                const userLogued = {
                    data: userFounded,
                    token: jwtToken
                }

                req.session.userLogued = userLogued

                res.status(200).json(userFounded)
            } else{
                next(new AppError("La contraseña introducida es incorrecta", 400))
            }
        } catch (err) {
            next(new AppError(err.message || err, 404))
        }
    }
})

// LOGOUT
exports.logout = wrapAsync(async (req, res, next) => {
    const jwtDestroyed = jwtMW.destroyJWT(req)

    if(jwtDestroyed){
        try {
            await promisify(req.session.destroy.bind(req.session))()
        } catch (err) {
            return next(new AppError("Error al destruir la sesión", 500))
        }
        res.clearCookie("mcnanosoft")
    } else{
        return next(new AppError("Error al Elimininar el Token o Sesión Inexistente", 500))
    }

    res.status(200).json({msg: "Logout Realizado Con Éxito"})
})

// OBTENER SESIÓN
exports.getSession = (req, res) => {
    if(!req.session.userLogued){
        res.status(204).json("No Estás Logueado")
    } else{
        res.status(200).json(req.session.userLogued)
    }
}

// REACTIVAR CUENTA
exports.reviveUser = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { active } = req.body

    if(req.session.userLogued && req.session.userLogued.data.profile == "Administrador"){
        const updatedUser = {
            active: active
        }
        try {
            const datosUsuarioActualizado = await usersModel.updateUserById(id, updatedUser)
            res.status(200).json(datosUsuarioActualizado)
        } catch (err) {
            next(new AppError(err.message || err, 404))
        }
    } else{
        next(new AppError("No estás autorizado", 403))
    }
})

// RECUPERAR CUENTA
exports.recoverAccount = wrapAsync(async (req, res, next) => {
    const { email } = req.body

    const emails = []

    const users = await usersModel.find({profile: "Usuario", oAuth: null})

    for (let user of users) {
        emails.push(user.email)
    }

    if(!emails.includes(email)){
        next(new AppError("El Correo Electrónico Introducido no está vinculado a ninguna cuenta", 404))
    } else{

        const token = crypto.randomBytes(32).toString("hex")
        const expires = Date.now() + 1000 * 60 * 5

        const html = `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Recuperación de Cuenta</title>
            <style>
            body {
                background-color: #0a0a0a;
                color: #ffffff;
                font-family: Arial, sans-serif;
                padding: 0;
                margin: 0;
            }

            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #191860;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
            }

            .title {
                font-size: 28px;
                margin-bottom: 10px;
                color: #ffffff;
                text-align: center;
            }

            .subtitle {
                font-size: 16px;
                color: #dddddd;
                text-align: center;
                margin-bottom: 30px;
            }

            .button {
                display: block;
                width: fit-content;
                margin: 0 auto;
                padding: 12px 24px;
                background-color: #cfcfcf;
                color: #191860;
                text-decoration: none;
                font-weight: bold;
                border-radius: 8px;
                transition: background-color 0.3s ease;
            }

            .button:hover {
                background-color: #cfcfcf;
            }

            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #aaaaaa;
                text-align: center;
            }

            .logo {
                width: 80px;
                margin: 0 auto 20px;
                display: block;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <img class="logo" src="https://localhost:3016/imgs/default/Logo MCNANO SOFT.png" alt="Logo" />

            <h1 class="title">¿Olvidaste tu contraseña?</h1>
            <p class="subtitle">
                Tranquilo, todos pasamos por esto. Haz clic en el siguiente botón para restablecer tu contraseña:
            </p>

            <a href="https://localhost:5173/reset-password?token=${token}" class="button">Restablecer contraseña</a>

            <p class="footer">
                Si no has solicitado este cambio, puedes ignorar este mensaje.
                <br />
                Este enlace expirará en 5 minutos.
            </p>
            </div>
        </body>
        </html>`

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.GOOGLE_APP_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Recuperar Cuenta",
            html: html
        }

        try {
            await transporter.sendMail(mailOptions)
            tokenCookie = { 
                token: token, 
                expires: expires
            }
            res.status(200).json({ message: "¡Correo Enviado!", token: token, expires: expires })
        } catch (error) {
            console.log(error)
            next(new AppError("No se pudo enviar el correo. Intentelo de nuevo o contacte con el Administrador", 500))
        }
    }
})

exports.resetAccount = wrapAsync(async (req, res, next) => {
    const { email } = req.params
    const { password, token, expires } = req.body

    console.log(token)
    if(tokenCookie && tokenCookie.token == token && Date.now() < expires){
        const userFounded = await usersModel.find({ email: email })


        if(userFounded && userFounded.length > 0){
            if(userFounded.password == password){
                next(new AppError("La nueva contraseña debe ser distinta a la actual", 400))
            } else{
                const newPassword = await bcrypt.hashPassword(password)
                if(newPassword){

                    const recoveredUser = {password: newPassword}

                    if(!userFounded.active){
                        recoveredUser.active = true
                    }

                    try {
                        const resetUserData = await usersModel.updateUserById(userFounded[0]._id, recoveredUser)
                        const jwtToken = jwtMW.createJWT(req, res, next, userFounded)
                        const userLogued = {
                            data: resetUserData,
                            token: jwtToken
                        }
                        req.session.userLogued = userLogued
                        res.status(200).json(userLogued)
                    } catch (err) {
                        next(new AppError(err.message || err, 400))
                    }
                }
            }
        }
    } else{
        next(new AppError("Token Inválida o Expirada", 403))
    }
})