const mongoose = require("mongoose")

// Esquema MongoDB
const ratingsSchema = new mongoose.Schema({
    idUser: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users",
        required: true
    },
    idProject: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "projects",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    opinion: {
        type: String,
        required: true
    },
    aproved: {
        type: String,
        enum: ["Pendiente", "Aprobado"],
        required: true
    },
    rated_at: {
        type: Date
    }
})

const ratings = mongoose.model("ratings", ratingsSchema)

let error = "No hay datos"

// CREATE RATING
ratings.createRating = async (ratingData, result) => {
    console.log("HE ENTRADO")
    ratingData.aproved = "Pendiente"
    ratingData.rated_at = new Date()
    const newRating = new ratings(ratingData)
    await newRating.save()
    .then((datos) => {
        result(null, datos)
    })
    .catch((err) => {
        result(err, null)
    })
}

// FIND ALL
ratings.findAll = async (result) => {
    const datos = await ratings.find({})
    if(datos && datos.aproved == "Aprobado"){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND RATING BY ID
ratings.findRatingById = async (id, result) => {
    error = "No se ha encontrado la opinión"
    const datos = await ratings.findById(id)
    if(datos && datos.aproved == "Aprobado"){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND RATING BY ID USER
ratings.findRatingByIdUser = async (idUser, result) => {
    error = "No se han encontrado las opiniones asociadas a este usuario"
    const datos = await ratings.find({idUser: idUser})
    if(datos && datos.aproved == "Aprobado"){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND RATING BY ID PROJECT
ratings.findRatingByIdProject = async (idProject, result) => {
    error = "No se han encontrado las opiniones asociadas a este proyecto"
    const datos = await ratings.find({idProject: idProject})
    if(datos && datos.length > 0){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// CHANGE APROVED
ratings.changeAproved = async (id, aproved, result) => {
    error = "No se ha podido aprobar la opinión"
    if(aproved){
        const datos = await ratings.findByIdAndUpdate(id, {aproved: "Aprobado"}, {runValidators: true, new: true})
        if(datos && datos.aproved == "Aprobado"){
            result(null, datos)
        } else{
            result(error, null)
        }
    } else{
        const datos = await ratings.findByIdAndDelete(id)
        if(datos){
            result(null, datos)
        } else{
            result("No se ha podido eliminar la opinión", null)
        }
    }
}

module.exports = ratings