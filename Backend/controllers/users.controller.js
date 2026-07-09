require("dotenv").config()
const usersModel = require("../models/users.model")
const AppError = require("../utils/AppError")
const bcrypt = require("../utils/bcrypt")
const jwtMW = require("../middlewares/jwt.mw")
const fs = require("fs")
const nodemailer = require("nodemailer")
const crypto = require("crypto")

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
    await usersModel.findAll((err, datosUsers) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosUsers)
        }
    })
})

// CREATE USER / REGISTER
exports.register = wrapAsync(async (req, res, next) => {
    const { username, password, firstName, lastName, email } = JSON.parse(req.body.user)
    const profilePicture = req.file

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
                    const profilePictureUrl = "imgs/users/" + profilePicture.originalname
                    fs.writeFile("public/" + profilePictureUrl, profilePicture.buffer, (err) => {
                        if(err){
                            next(new AppError(err, 500))
                        }
                    })

                    newUser.profilePicture = profilePictureUrl
                }

                // CIFRAR CONTRASEÑA
                newUser.password = await bcrypt.hashPassword(newUser.password)

                console.log(newUser)
                await usersModel.createUser(newUser, (err, datosUsuarioCreado) => {
                    if(err){
                        next(new AppError(err, 400))
                    } else{
                        if(!req.session.userLogued){
                            const jwtToken = jwtMW.createJWT(req, res, next, datosUsuarioCreado)
                            const userLogued = {
                                data: datosUsuarioCreado,
                                token: jwtToken
                            }

                            req.session.userLogued = userLogued
                        }

                        res.status(200).json(datosUsuarioCreado)
                    }
                })
            } else{
                next(new AppError(errorMessage, 400))
            }            
        }
    }
})

// FIND BY ID
exports.findUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await usersModel.findUserById(id, (err, datosUser) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosUser)
        }
    })
})

// UPDATE BY ID
exports.updateUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { username, firstName, lastName, email, currentPassword = "", newPassword = "" } = JSON.parse(req.body.user)
    const profilePicture = req.file

    const userLogued = req.session.userLogued.data

    if(userLogued._id != id){
        next(new AppError("No estás autorizado", 403))
    } else{
        let updatedUser = {}
        const user = await usersModel.findById(id)
        if(currentPassword != "" && newPassword != ""){
            const validado = await bcrypt.compareLogin(currentPassword, user.password)
        
            if(validado){
                if(newPassword.length < 8){
                    next(new AppError("Aumenta la longitud de la contraseña en 8 caracteres como mínimo",400))
                }else if(!newPassword.match(/[A-Z]/)){
                   next(new AppError("La contraseña debe tener al menos una mayúscula",400))
                }else if(!newPassword.match(/[a-z]/)){
                   next(new AppError("La contraseña debe tener al menos una minúscula",400))
                }else if(!newPassword.match(/[/\d/]/)){
                   next(new AppError("La contraseña debe tener al menos un número",400))
                }else if(!newPassword.match(/^(?=.*[!@#$%^&*(),.?":{}|<>_=+-])/)){
                   next(new AppError("La contraseña debe tener al menos un carácter especial",400))
                } else{
    
                    if(newPassword === currentPassword){
                        next(new AppError("La nueva contraseña debe ser distinta a la actual", 400))
                    } else{
                        const password = await bcrypt.hashPassword(newPassword)
    
                        updatedUser = {
                            username: username,
                            password: password,
                            firstName: firstName,
                            lastName: lastName,
                            email: email
                        }
    
                        if(profilePicture){
                            const profilePictureUrl = "imgs/users/" + username + profilePicture.originalname.match(/\.[^.]+$/)
                            fs.writeFile("public/" + profilePictureUrl, profilePicture.buffer, (err) => {
                                if(err){
                                    next(new AppError(err, 500))
                                }
                            })
            
                            updatedUser.profilePicture = profilePictureUrl
                        }
                    }
                }
            } else{
                next(new AppError("La contraseña actual es incorrecta", 400))
            }
        } else if(currentPassword == "" && newPassword != ""){
            next(new AppError("La contraseña actual es requerida", 400))
        } else if(currentPassword != "" && newPassword == ""){
            next(new AppError("La nueva contraseña es requerida", 400))
        } else if(username && username != ""){
            if(username && username != ""){
                updatedUser.username = username
            }

            if(firstName && firstName != ""){
                updatedUser.firstName = firstName
            }

            if(lastName && lastName != ""){
                updatedUser.lastName = lastName
            }

            if(email && email != ""){
                updatedUser.email = email
            }

            if(profilePicture){
                const profilePictureUrl = "imgs/users/" + username + profilePicture.originalname.match(/\.[^.]+$/)
                fs.writeFile("public/" + profilePictureUrl, profilePicture.buffer, (err) => {
                    if(err){
                        next(new AppError(err, 500))
                    }
                })

                updatedUser.profilePicture = profilePictureUrl
            }
        }

        if(updatedUser){
            await usersModel.updateUserById(id, updatedUser, (err, datosUsuarioActualizado) => {
                if(err){
                    next(new AppError(err, 400))
                } else{
    
                    console.log(datosUsuarioActualizado)

                    req.session.userLogued.data = datosUsuarioActualizado
    
                    res.status(200).json(datosUsuarioActualizado)
                }
            })
        }
    }
})

// DELETE BY ID
exports.deleteUserByID = wrapAsync(async (req, res, next) => {
    const { id } = req.params

    const userLogued = req.session.userLogued.data

    if(userLogued._id != id && userLogued.profile != "Administrador"){
        next(new AppError("No estás autorizado", 403))
    } else{
        await usersModel.deleteUserById(id, (err, datosUsuarioEliminado) => {
            if(err){
                next(new AppError(err, 404))
            } else{

                if(userLogued._id == id){
                    return exports.logout(req, res, next)
                }

                res.status(200).json(datosUsuarioEliminado)
            }
        })
    }
})

// #region LOGIN/LOGOUT
// <============ LOGIN/LOGOUT ============>

// LOGIN
exports.login = wrapAsync(async (req, res, next) => {
    const { username, password } = req.body

    if(req.session.userLogued){
        next(new AppError("Ya estás Logueado", 400))
    } else{
        await usersModel.findUserByUsername(username, async function(err, userFounded){
            if(err){
                next(new AppError(err, 404))
            } else{
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
            }
        })
    }
})

// LOGOUT
exports.logout = (req, res, next) => {
    const jwtDestroyed = jwtMW.destroyJWT(req)

    if(jwtDestroyed){
        req.session.destroy((err) => {
            if(err){
                return next(new AppError("Error al destruir la sesión", 500))
            }
        })
        res.clearCookie("mcnanosoft")
    } else{
        next(new AppError("Error al Elimininar el Token o Sesión Inexistente", 500))
    }

    res.status(200).json({msg: "Logout Realizado Con Éxito"})
}

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
        await usersModel.updateUserById(id, updatedUser, async function(err, datosUsuarioActualizado) {
            if(err){
                next(new AppError(err, 404))
            } else{
                res.status(200).json(datosUsuarioActualizado)
            }
        })
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

                    await usersModel.updateUserById(userFounded[0]._id, recoveredUser, (err, resetUserData) => {
                        if(err){
                            next(new AppError(err, 400))
                        } else{
                            const jwtToken = jwtMW.createJWT(req, res, next, userFounded)

                            const userLogued = {
                                data: resetUserData,
                                token: jwtToken
                            }

                            req.session.userLogued = userLogued

                            res.status(200).json(userLogued)
                        }
                    })
                }
            }
        }
    } else{
        next(new AppError("Token Inválida o Expirada", 403))
    }
})