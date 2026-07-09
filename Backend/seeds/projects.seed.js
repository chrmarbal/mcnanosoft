const mongoDBConfig = require("../utils/mongodb.config")
const projectsModel = require("../models/projects.model")

// Creamos los Proyectos por defecto
const defaultProjects = async () => {
    await mongoDBConfig.conectarMongoDB()
    .then(() => {
        console.log("Conectado con MongoDB!!")
    })
    .catch((err) => {
        console.log(`Error al Conectar con MongoDB. Desc: ${err}`)
        process.exit(0)
    })

    const projects = [
        {
            name: "Pensator",
            description: "Fantástico Juego de Adivinar Palabras! Sumergete en este gran acertijo que pondrá a prueba tus capacidades de adivinanza.",
            price: "14.99€",
            size: "197MB",
            projectIcon: "imgs/projects/Pensator.png",
            projectUrl: "1elnxGFfpBbRo6uCJJm69NDYPtMAJzuFa",
            technology: "Java",
            thumbnail: "imgs/projects/portadas/Pensator.png",
            openSource: false,
            purchases: 1,
            deleted: false,
            created_at: new Date()
        },
        {
            name: "Con4Basta",
            description: "Buscas un desafío que ponga a prueba tu inteligencia y tu ingenio. Juega con un amigo o contra la máquina y demuestra de lo que eres capaz.",
            price: "FREE",
            size: "3KB",
            projectIcon: "imgs/projects/Con4Basta.png",
            projectUrl: "17AQim36iubjojJsIMY-XRP0kbSgB_4Md",
            technology: "Java",
            thumbnail: "imgs/projects/portadas/Con4Basta.png",
            openSource: true,
            gitHubRepoUrl: "https://github.com/chrmarbal/Con4Basta",
            purchases: 1,
            deleted: false,
            created_at: new Date()
        },
        {
            name: "Panteras FCT Administrator",
            description: "Gestor de prácticas FCT de alumnos, que gracias a su diseño sencillo e intuitivo permite gestionar fácilmente las inscripciones de alumnos a empresas para la realización de prácticas FCT.",
            price: "49.99€",
            size: "53.5MB",
            projectIcon: "imgs/projects/logo-panteras.png",
            projectUrl: "1m73vHa7cUa0EO_XHvOwdcHvEJWaK8wCU",
            technology: "JavaScript",
            thumbnail: "imgs/projects/portadas/Panteras FCT Administrator.png",
            openSource: false,
            purchases: 0,
            deleted: false,
            created_at: new Date()
        }
    ]

    await projectsModel.insertMany(projects)
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    })
    
    process.exit(0)
}

defaultProjects()