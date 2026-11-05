const passport = require("passport")
const { promisify } = require("util")
require("../middlewares/oAuthGoogle.mw")
const AppError = require("../utils/AppError")
const jwtMW = require("../middlewares/jwt.mw")
const googleApis = require("googleapis").google
const usersModel = require("../models/users.model")
const { normalizeOAuthUsername } = require("../utils/usernames")
const frontendUrl = process.env.FRONTEND_URL || (
    process.env.VERCEL ? "https://mcnanosoft.vercel.app" : "https://localhost:5173"
)

exports.passportAuthenticate = passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false
})

exports.passportCallback = (req, res, next) => {
    passport.authenticate("google", {session: false}, (err, profile) => {
        if (err) return next(err)
        if (!profile) return res.redirect(`${frontendUrl}/login`)

        req.oauthProfile = profile
        next()
    })(req, res, next)
}

exports.passportSuccess = async (req, res, next) => {
    // Login OK con Google
    const userDataGoogle = req.oauthProfile
    if (!userDataGoogle) {
        return next(new AppError("No se pudo recuperar el perfil de Google", 401))
    }

    const username = normalizeOAuthUsername(userDataGoogle.displayName)
    
    const users = await usersModel.find({profile: "Usuario"})
    let addUser = true
    for (let user of users) {
        if(user.username == username){
            addUser = false
            break
        }
    }

    let userData = {
        username,
        firstName: userDataGoogle.given_name,
        lastName: userDataGoogle.family_name ? userDataGoogle.family_name : userDataGoogle.given_name,
        email: userDataGoogle.email,
        profilePicture: userDataGoogle.picture,
        library: [],
        profile: "Usuario",
        oAuth: "Google",
        active: true,
        created_at: new Date()
    }

    if(addUser){
        try {
            const createdUserData = await usersModel.createUser(userData)
            const jwtToken = jwtMW.createJWT(req, res, next, userData)
            const userLogued = {
                data: createdUserData,
                token: jwtToken
            }

            req.userLogued = userLogued
        } catch (err) {
            next(new AppError(err, 400))
            return
        }
    } else{
        const user = await usersModel.findOne({username: userData.username})
        if(user && user._id){
            const jwtToken = jwtMW.createJWT(req, res, next, user)
            const userLogued = {
                data: user,
                token: jwtToken
            }
        
            req.userLogued = userLogued
        }
    }
    
    // Una vez nos hemos logueado con Google, nos lleva al Inicio
    res.redirect(frontendUrl)
}

exports.passportFailure = (req, res, next) => {
    res.redirect(`${frontendUrl}/login`)
}

exports.passportLogout = async (req, res, next) => {
    try {
        await promisify(req.session.destroy.bind(req.session))()
        req.userLogued = null
    } catch (err) {
        return next(new AppError("Error al destruir la sesión", 500))
    }
    res.redirect(frontendUrl)
}