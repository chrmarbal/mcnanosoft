const passport = require("passport")
const { promisify } = require("util")
require("../middlewares/oAuthGoogle.mw")
const AppError = require("../utils/AppError")
const jwtMW = require("../middlewares/jwt.mw")
const googleApis = require("googleapis").google
const usersModel = require("../models/users.model")

exports.passportAuthenticate = passport.authenticate("google", {scope: ["email", "profile"]})

exports.passportCallback = passport.authenticate("google", {
    successRedirect: "/auth/google/protected",
    failureRedirect: "/auth/google/failure"
})

exports.passportSuccess = async (req, res, next) => {
    // Login OK con Google
    let userDataGoogle = req.session.passport.user
    
    const users = await usersModel.find({profile: "Usuario"})
    let addUser = true
    for (let user of users) {
        if(user.username == userDataGoogle.displayName){
            addUser = false
            break
        }
    }

    let userData = {
        username: userDataGoogle.displayName,
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

            req.session.userLogued = userLogued
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
        
            req.session.userLogued = userLogued
        }
    }
    
    // Una vez nos hemos logueado con Google, nos lleva al Inicio
    res.redirect("https://localhost:5173")
}

exports.passportFailure = (req, res, next) => {
    res.redirect("https://localhost:5173/login")
}

exports.passportLogout = async (req, res, next) => {
    try {
        await promisify(req.session.destroy.bind(req.session))()
    } catch (err) {
        return next(new AppError("Error al destruir la sesión", 500))
    }
    res.redirect("https://localhost:5173")
}