const mongoDBConfig = require("../utils/mongodb.config")
const usersModel = require("../models/users.model")
const projectsModel = require("../models/projects.model")

// Creamos Usuarios por Defecto
const defaultUsers = async () => {
    await mongoDBConfig.conectarMongoDB()
    .then(() => {
        console.log("Conectado con MongoDB!!")
    })
    .catch((err) => {
        console.log(`Error al Conectar con MongoDB. Desc: ${err}`)
        process.exit(0)
    })

    const projects = await projectsModel.find({})

    const adminLibrary = []
    for (let project of projects) {
        adminLibrary.push({idProject: project._id})
    }

    const users = [
        {
            username: "Administrador",
            password: "$2b$12$3RhdMXnjbhd6Alr/hEWhxOKkCrwHJ.5gxPPUh8heCywWAkVVXsqsO",
            firstName: "admin",
            lastName: "admin",
            email: "mcnanosoft.info@gmail.com",
            library: adminLibrary,
            profilePicture: null,
            profile: "Administrador",
            active: true,
            created_at: new Date()
        },
        {
            username: "paco_porras",
            password: "$2b$12$gpsDblSYYsw0KtNMF46oFOM3FwmFepHJWDN8Pea7jWOt1Sae9QdZ2",
            firstName: "Paco",
            lastName: "Porras",
            email: "pacoPorras@gmail.com",
            library: [{idProject: projects[0]._id}],
            profile: "Usuario",
            active: true,
            created_at: new Date()
        },
        {
            username: "morenito69",
            password: "$2b$12$TMLqxuIV9Tv/pf9yD1ispuIN8vjezmL7hTwx9k4YVh/zOXfCnv1um",
            firstName: "Morenito",
            lastName: "Morenote",
            email: "morenito69@gmail.com",
            library: [{idProject: projects[1]._id}],
            profile: "Usuario",
            active: true,
            created_at: new Date()
        }
    ]

    await usersModel.insertMany(users)
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    })

    process.exit(0)
}

defaultUsers()