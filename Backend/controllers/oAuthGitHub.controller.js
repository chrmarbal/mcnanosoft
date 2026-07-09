const passport = require("passport")
require("../middlewares/oAuthGitHub.mw")
const AppError = require("../utils/AppError")
const jwtMW = require("../middlewares/jwt.mw")
const usersModel = require("../models/users.model")

// Inicia la autenticación con GitHub
exports.passportAuthenticate = passport.authenticate("github", { scope: ["user", "user:email"] })

// Callback después de GitHub login
exports.passportCallback = passport.authenticate("github", {
    successRedirect: "/auth/github/protected",
    failureRedirect: "/auth/github/failure"
})

// Éxito en la autenticación
exports.passportSuccess = async (req, res, next) => {
    let userDataGitHub = req.session.passport.user

    const users = await usersModel.find({profile: "Usuario"})
    let addUser = true
    for (let user of users) {
        if(user.username == userDataGitHub.username){
            addUser = false
            break
        }
    }

    const userData = {
        username: userDataGitHub.username,
        firstName: userDataGitHub.username,
        lastName: userDataGitHub.username,
        profilePicture: userDataGitHub.photos[0].value,
        library: [],
        profile: "Usuario",
        oAuth: "GitHub",
        active: true,
        created_at: new Date()
    }

    if(userDataGitHub.email){
        userData.email = userDataGitHub.email
    }


    if(addUser){
        await usersModel.createUser(userData, (err, createdUserData) => {
            if(err){
                next(new AppError(err, 400))
            } else{
                const jwtToken = jwtMW.createJWT(req, res, next, userData)
                const userLogued = {
                    data: createdUserData,
                    token: jwtToken
                }
                
                req.session.userLogued = userLogued
            }
        })
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
        
    // Una vez nos hemos logueado con GitHub, nos lleva al Inicio
    res.redirect("https://localhost:5173")
}

// Falla el login con GitHub
exports.passportFailure = (req, res, next) => {
    // next(new AppError("Fallo al loguear con GitHub", 500))
    res.redirect("https://localhost:5173/login")
}

// Logout destroy
exports.passportLogout = (req, res) => {
    req.session.destroy()
    res.redirect("https://localhost:5173")
}