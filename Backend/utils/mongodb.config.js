require("dotenv").config()
const mongoose = require("mongoose") // npm i mongoose

// Conexión con MongoDB
exports.conectarMongoDB = async () => {
    return mongoose.connect(process.env.MONGODB_CONSTRING)
}