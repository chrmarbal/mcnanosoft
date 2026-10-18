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

// <=============== CRUD PROJECTS ===============>

// CREATE PROJECT
projects.createProject = async (projectData) => {
    projectData.created_at = new Date()
    const newProject = new projects(projectData)

    const datos = await newProject.save()
    const adminData = await usersModel.findOne({profile: "Administrador"})
    if(adminData){
        adminData.library = adminData.library || []
    }
    if(adminData && !adminData.library.some(item => String(item.idProject || item) === String(datos._id))){
        adminData.library.push({idProject: datos._id})
        await adminData.save()
    }
    return datos
}

// FIND ALL PROJECTS
projects.findAll = async () => {
    const datos = await projects.find({})
    if(datos && datos.length > 0){
        return datos
    } else{
        throw new Error("No hay datos")
    }
}

// FIND PROJECT BY ID
projects.findProjectById = async (id) => {
    const datos = await projects.findById(id)
    if(datos && !datos.deleted){
        return datos
    } else{
        throw new Error("No se ha encontrado el Proyecto")
    }
}

// UPDATE PROJECT BY ID
projects.updateProjectById = async (id, projectData) => {
    if(projectData.deleted){
        throw new Error("No se ha encontrado el Proyecto")
    }

    projectData.modified_at = new Date()
    const datos = await projects.findByIdAndUpdate(id, projectData, {runValidators: true, new: true})
    if(!datos){
        throw new Error("No se ha encontrado el Proyecto")
    }
    return datos
}

// DELETE PROJECT BY ID
projects.deleteProjectById = async (id) => {
    const datosProyecto = await projects.findById(id)
    if(!datosProyecto){
        throw new Error("No se ha encontrado el Proyecto")
    }
    datosProyecto.deleted = true

    const datos = await projects.findByIdAndUpdate(id, datosProyecto, {runValidators: true, new: true})
    if(!datos){
        throw new Error("No se ha encontrado el Proyecto")
    }
    return datos
}

// Exportamos el Modelo
module.exports = projects