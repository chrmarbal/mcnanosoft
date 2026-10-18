require("dotenv").config()
const mongoose = require("mongoose") // npm i mongoose

let cachedConnection = null

// Conexión con MongoDB optimizada para Serverless
exports.conectarMongoDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection
    }

    try {
        cachedConnection = await mongoose.connect(process.env.MONGODB_CONSTRING, {
            bufferCommands: false, // Desactiva el búfer para que falle rápido si hay problemas de red
        })
        console.log("¡Conexión establecida con MongoDB Atlas con éxito!")
        return cachedConnection
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error)
        throw error
    }
}