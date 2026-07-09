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

let error = "No hay datos"

// <=============== CRUD USERS ===============>

// CREATE USER
users.createUser = async (userData, result) => {
    const newUser = new users(userData)
    await newUser.save()
    .then((datos) => {
        result(null, datos)
    })
    .catch((err) => {
        result(err, null)
    })
}

// FIND ALL USERS
users.findAll = async (result) => {
    const datos = await users.find({ profile: "Usuario" })
    if(datos && datos.length > 0){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND USER BY ID
users.findUserById = async (id, result) => {
    error = "No se ha encontrado el Usuario"
    const datos = await users.findById(id)
    console.log(datos)
    if(datos && datos.active){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND USER BY USERNAME
users.findUserByUsername = async (username, result) => {
    error = "No se ha encontrado el Usuario"
    const datos = await users.find({ username: username })
    if(datos && datos[0] && datos[0].active){
        result(null, datos[0])
    } else{
        result(error, null)
    }
}

// UPDATE USER BY ID
users.updateUserById = async (id, userData, result) => {
    error = "No se ha encontrado el Usuario"
    userData.modified_at = new Date()
    await users.findByIdAndUpdate(id, userData, {runValidators: true, new: true})
    .then((datos) => {
        if(datos){
            result(null, datos)
        } else{
            result(error, null)
        }
    })
    .catch((err) => {
        result(err, null)
    })
}

// DELETE USER BY ID
users.deleteUserById = async (id, result) => {
    error = "No se ha encontrado el Usuario"
    
    const deletedUser = { active: false }

    await users.findByIdAndUpdate(id, deletedUser)
    .then((datos) => {
        if(datos == null){
            result(error, null)
        } else{
            result(null, datos)
        }
    })
    .catch((err) => {
        result(err, null)
    })
}

// Exportamos el Modelo
module.exports = users