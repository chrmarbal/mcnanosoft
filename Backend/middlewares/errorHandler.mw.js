const logger = require("../utils/logger")

exports.errorHandler = (err,req, res, next) => {
    let status = 500, message = "Error en el Servidor"

    if(err.status){
        status = err.status
    }
    
    if(err.message && err.message.error){ 
        message = err.message.error
    } else{
        message = err.message
    }

    console.log("------ ERROR ------")
    console.log("Status: " + status)
    console.log("Message: " + message)
    logger.error.error(message + ". Status: " + status)
    
    res.status(status).json(message)
}