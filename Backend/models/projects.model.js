const mongoose = require("mongoose")
const usersModel = require("./users.model")

// Esquema MongoDB
const projectsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    projectIcon: {
        type: String,
        required: true
    },
    projectUrl: {
        type: String,
        required: true
    },
    technology: {
        type: String,
        enum: ["Java", "JavaScript", "Python", "PHP", "C", "C++", "C#"],
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    openSource: {
        type: Boolean,
        required: true
    },
    gitHubRepoUrl: {
        type: String
    },
    purchases: {
        type: Number,
        required: true,
        default: 0
    },
    deleted: {
        type: Boolean,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    },
    modified_at: {
        type: Date    
    }
})

const projects = mongoose.model("projects", projectsSchema)

let error = "No hay datos"

// <=============== CRUD PROJECTS ===============>

// CREATE PROJECT
projects.createProject = async (projectData, result) => {
    projectData.created_at = new Date()
    const newProject = new projects(projectData)

    await newProject.save()
    .then(async(datos) => {
        const adminData = await usersModel.findOne({profile: "Administrador"})
        if(adminData){
            adminData.library = adminData.library || []
        }
        if(adminData && !adminData.library.some(item => String(item.idProject || item) === String(datos._id))){
            adminData.library.push({idProject: datos._id})
            await adminData.save()
        }
        result(null, datos)
    })
    .catch((err) => {
        result(err, null)
    })
}

// FIND ALL PROJECTS
projects.findAll = async (result) => {
    const datos = await projects.find({})
    if(datos && datos.length > 0){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND PROJECT BY ID
projects.findProjectById = async (id, result) => {
    error = "No se ha encontrado el Proyecto"
    const datos = await projects.findById(id)
    if(datos && !datos.deleted){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// UPDATE PROJECT BY ID
projects.updateProjectById = async (id, projectData, result) => {
    error = "No se ha encontrado el Proyecto"
    if(projectData.deleted){
        result(error, null)
    } else{
        projectData.modified_at = new Date()
        await projects.findByIdAndUpdate(id, projectData, {runValidators: true, new: true})
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
}

// DELETE PROJECT BY ID
projects.deleteProjectById = async (id, result) => {
    error = "No se ha encontrado el Proyecto"
    
    const datosProyecto = await projects.findById(id)
    datosProyecto.deleted = true


    await projects.findByIdAndUpdate(id, datosProyecto, {runValidators: true, new: true})
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
module.exports = projects