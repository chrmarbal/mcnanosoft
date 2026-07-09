const ratingsModel = require("../models/ratings.model")
const usersModel = require("../models/users.model")
const projectsModel = require("../models/projects.model")
const mongoDBConfig = require("../utils/mongodb.config")

// Creamos Valoraciones por defecto
const defaultRatings = async () => {
    await mongoDBConfig.conectarMongoDB()
    .then(() => {
        console.log("Conectado con MongoDB!!")
    })
    .catch((err) => {
        console.log(`Error al Conectar con MongoDB. Desc: ${err}`)
        process.exit(0)
    })

    const users = await usersModel.find({})
    const projects = await projectsModel.find({})

    const ratings = [
        {
            idUser: users[1]._id,
            idProject: projects[0]._id,
            rating: 4,
            opinion: "Me gusta bastante el juego pero creo que el original creado por Pepetoni Soft estaba mejor, pero buen tributo",
            aproved: "Aprobado",
            rated_at: new Date()
        }
    ]

    await ratingsModel.insertMany(ratings)
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    })

    process.exit(0)
}

defaultRatings()