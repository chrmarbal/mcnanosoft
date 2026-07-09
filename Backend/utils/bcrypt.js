const bcrypt = require("bcrypt")

// Función Encriptación Contraseñas
exports.hashPassword = async (contraseñaTextoPlano) => {
    return await bcrypt.hash(contraseñaTextoPlano, 12)
}

// Función Comparar Contraseña con Contraseña Cifrada
exports.compareLogin = async (contraseñaTextoPlano, contraseñaCifrada) => {
    const result = await bcrypt.compare(contraseñaTextoPlano, contraseñaCifrada)

    if(result){
        return true
    } else{
        return false
    }
}