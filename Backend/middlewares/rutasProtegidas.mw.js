const AppError = require("../utils/AppError")

const checkProfile = (req,profile) =>{
    if(req.session && req.session.userLogued && req.session.userLogued.data && req.session.userLogued.data.profile && req.session.userLogued.data.profile == profile){
        return true
    }else{
        false
    }
}

exports.requireAdmin = (req,res,next) =>{
    if(checkProfile(req,"Administrador")){
        next()
    }else{
        next(new AppError("No estás autorizado",403))
    }
}