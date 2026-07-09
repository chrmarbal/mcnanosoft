const mongoDBConfig = require("../utils/mongodb.config")
const purchasesModel = require("../models/purchases.model")
const usersModel = require("../models/users.model")
const projectsModel = require("../models/projects.model")

// Creamos Compras por defecto
const defaultPurchases = async () => {
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

    const purchases = [
        {
            idUser: users[1]._id,
            lines: [
                {
                    idProject: projects[0]._id,
                    amount: projects[0].price != "FREE" ? parseFloat(projects[0].price.replace("€", "")) : 0
                },
            ],
            purchased_at: new Date(),
            pay_method: "PayPal",
            state: "Pagado",
            amount: projects[0].price != "FREE" ? parseFloat(projects[0].price.replace("€", "")) : 0
        },
        {
            idUser: users[2]._id,
            lines: [
                {
                    idProject: projects[1]._id,
                    amount: projects[1].price != "FREE" ? parseFloat(projects[1].price.replace("€", "")) : 0
                },
            ],
            purchased_at: new Date(),
            pay_method: "Credit Card",
            state: "Pagado",
            amount: projects[1].price != "FREE" ? parseFloat(projects[1].price.replace("€", "")) : 0
        }
    ]

    await purchasesModel.insertMany(purchases)
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    })

    process.exit(0)
}

defaultPurchases()