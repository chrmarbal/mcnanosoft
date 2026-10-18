const mongoose = require("mongoose")
const { type } = require("os")
const { Schema } = mongoose

// Esquema MongoDB
const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    library: [
        {
            idProject: {
                type: Schema.Types.ObjectId,
                ref: "projects",
                required: true
            }
        }
    ],
    profilePicture: {
        type: String
    },
    profile: {
        type: String,
        enum: ["Administrador", "Usuario"],
        required: true
    },
    oAuth: {
        type: String
    },
    active: {
        type: Boolean    
    },
    created_at: {
        type: Date,
        required: true
    },
    modified_at: {
        type: Date
    }
})

const users = mongoose.model("users", usersSchema)

// <=============== CRUD USERS ===============>

// CREATE USER
users.createUser = async (userData) => {
    const newUser = new users(userData)
    return await newUser.save()
}

// FIND ALL USERS
users.findAll = async () => {
    const datos = await users.find({ profile: "Usuario" })
    if(datos && datos.length > 0){
        return datos
    } else{
        throw new Error("No hay datos")
    }
}

// FIND USER BY ID
users.findUserById = async (id) => {
    const datos = await users.findById(id)
    if(datos && datos.active){
        return datos
    } else{
        throw new Error("No se ha encontrado el Usuario")
    }
}

// FIND USER BY USERNAME
users.findUserByUsername = async (username) => {
    const datos = await users.find({ username: username })
    if(datos && datos[0] && datos[0].active){
        return datos[0]
    } else{
        throw new Error("No se ha encontrado el Usuario")
    }
}

// UPDATE USER BY ID
users.updateUserById = async (id, userData) => {
    userData.modified_at = new Date()
    const datos = await users.findByIdAndUpdate(id, userData, {runValidators: true, new: true})
    if(!datos){
        throw new Error("No se ha encontrado el Usuario")
    }
    return datos
}

// DELETE USER BY ID
users.deleteUserById = async (id) => {
    const deletedUser = { active: false }
    const datos = await users.findByIdAndUpdate(id, deletedUser)
    if(!datos){
        throw new Error("No se ha encontrado el Usuario")
    }
    return datos
}

// Exportamos el Modelo
module.exports = users