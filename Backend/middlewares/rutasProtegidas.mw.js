const AppError = require("../utils/AppError")

const checkProfile = (req,profile) =>{
    if(req.userLogued && req.userLogued.data && req.userLogued.data.profile && req.userLogued.data.profile == profile){
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