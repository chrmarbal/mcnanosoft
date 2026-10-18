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

// CREATE RATING
ratings.createRating = async (ratingData) => {
    ratingData.aproved = "Pendiente"
    ratingData.rated_at = new Date()
    const newRating = new ratings(ratingData)
    return await newRating.save()
}

// FIND ALL
ratings.findAll = async () => {
    const datos = await ratings.find({})
    if(datos && datos.aproved == "Aprobado"){
        return datos
    } else{
        throw new Error("No hay datos")
    }
}

// FIND RATING BY ID
ratings.findRatingById = async (id) => {
    const datos = await ratings.findById(id)
    if(datos && datos.aproved == "Aprobado"){
        return datos
    } else{
        throw new Error("No se ha encontrado la opinión")
    }
}

// FIND RATING BY ID USER
ratings.findRatingByIdUser = async (idUser) => {
    const datos = await ratings.find({idUser: idUser})
    if(datos && datos.aproved == "Aprobado"){
        return datos
    } else{
        throw new Error("No se han encontrado las opiniones asociadas a este usuario")
    }
}

// FIND RATING BY ID PROJECT
ratings.findRatingByIdProject = async (idProject) => {
    const datos = await ratings.find({idProject: idProject})
    if(datos && datos.length > 0){
        return datos
    } else{
        throw new Error("No se han encontrado las opiniones asociadas a este proyecto")
    }
}

// CHANGE APROVED
ratings.changeAproved = async (id, aproved) => {
    if(aproved){
        const datos = await ratings.findByIdAndUpdate(id, {aproved: "Aprobado"}, {runValidators: true, new: true})
        if(datos && datos.aproved == "Aprobado"){
            return datos
        } else{
            throw new Error("No se ha podido aprobar la opinión")
        }
    } else{
        const datos = await ratings.findByIdAndDelete(id)
        if(datos){
            return datos
        } else{
            throw new Error("No se ha podido eliminar la opinión")
        }
    }
}

module.exports = ratings