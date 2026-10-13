const mongoose = require("mongoose")
const { Schema } = mongoose
const usersModel = require("./users.model")
const projectsModel = require("./projects.model")

const purchasesSchema = new mongoose.Schema({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    lines: [
        {
            idProject: {
                type: Schema.Types.ObjectId,
                ref: "projects",
                required: true
            },
            amount: {
                type: Schema.Types.Decimal128,
                required: true
            }
        }
    ],
    purchased_at: {
        type: Date,
        required: true
    },
    pay_method: {
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ["Pendiente", "Pagado", "Cancelado"]
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: true
    },
    stripeSessionId: {
        type: String
    }
})

const purchases = mongoose.model("purchases", purchasesSchema)

let error = "No hay datos"
// <=============== CRUD PURCHASES ===============>

// CREATE PURCHASE
purchases.createPurchase = async (purchaseData, result) => {
    let createdPurchase
    purchaseData.purchased_at = new Date()
    
    const newPurchase = new purchases(purchaseData)
    await newPurchase.save()
    .then((datos) => {
        result(null, datos)
    })
    .catch((err) => {
        result(err, null) 
    })    
}

// FIND ALL PURCHASES
purchases.findAll = async (result) => {
    const datos = await purchases.find({})
    if(datos && datos.length > 0){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND PURCHASE BY ID
purchases.findPurchaseById = async (id, result) => {
    error = "No se ha encontrado la compra"
    const datos = await purchases.findById(id)
    if(datos){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// FIND PURCHASE BY USER ID
purchases.findPurchaseByIdUser = async (idUser, result) => {
    error = "No se ha encontrado la compra"
    const datos = await purchases.find({idUser: idUser})
    if(datos){
        result(null, datos)
    } else{
        result(error, null)
    }
}

// UPDATE STATE OF PURCHASE BY ID
purchases.updateStateById = async (id, newState, result) => {
    try {
        const purchase = await purchases.findById(id)
        if (!purchase) throw new Error("Compra no encontrada")

        if (purchase.state === newState) {
            result(null, purchase)
            return
        }

        const updatedPurchase = await purchases.findByIdAndUpdate(
            id,
            { state: newState },
            { runValidators: true, new: true }
        )

        const user = await usersModel.findById(updatedPurchase.idUser)
        if (!user) throw new Error("Usuario no encontrado")
        user.library = user.library || []

        if (purchase.state === "Pagado" && newState !== "Pagado") {
            for (const line of updatedPurchase.lines) {
                const project = await projectsModel.findById(line.idProject)
                if (project) {
                    project.purchases = Math.max((project.purchases || 0) - 1, 0)
                    await project.save()
                }
            }

            // Quitar proyectos de la librería
            user.library = user.library.filter(entry =>
                !updatedPurchase.lines.some(line => String(line.idProject) === String(entry.idProject || entry))
            )
            await user.save()
        } else if (purchase.state !== "Pagado" && newState === "Pagado") {
            for (const line of updatedPurchase.lines) {
                const project = await projectsModel.findById(line.idProject)
                if (project) {
                    project.purchases = (project.purchases || 0) + 1
                    await project.save()
                }

                // Añadir solo si no está ya
                if (!user.library.some(entry => String(entry.idProject || entry) === String(line.idProject))) {
                    user.library.push({idProject: line.idProject})
                }
            }

            await user.save()
        }

        result(null, updatedPurchase)
    } catch (err) {
        console.error("Error updateStateById:", err.message)
        result("No se ha podido actualizar el estado de la compra", null)
    }
}

module.exports = purchases