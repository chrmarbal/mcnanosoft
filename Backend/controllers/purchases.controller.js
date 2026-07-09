const purchasesModel = require("../models/purchases.model")
const usersModel = require("../models/users.model")
const AppError = require("../utils/AppError")

// Función Para Capturar Errores Asíncronos
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => {
            next(e)
        })
    }
}

// #region CRUD PURCHASES
// <============ CRUD PURCHASES ============>

// FIND ALL
exports.findAllPurchases = wrapAsync(async (req, res, next) => {
    await purchasesModel.findAll((err, datosPurchases) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosPurchases)
        }
    })   
})

// CREATE PURCHASE
exports.createPurchase = wrapAsync(async (req, res, next) => {
    const { idUser, lines, pay_method, state, amount } = req.body

    const newPurchase = {
        idUser: idUser,
        lines: lines,
        pay_method: pay_method,
        state: state,
        amount: amount
    }

    await purchasesModel.createPurchase(newPurchase, (err, datosCreatedPurchase) => {
        if(err){
            next(new AppError(err, 400))
        } else{
            res.status(200).json(datosCreatedPurchase)
        }
    })
})

// FIND BY ID
exports.findPurchaseById = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await purchasesModel.findPurchaseById(id, (err, datosPurchase) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosPurchase)
        }
    })
})

// FIND BY ID USER
exports.findPurchaseByIdUser = wrapAsync(async (req, res, next) => {
    const { idUser } = req.params
    await purchasesModel.findPurchaseByIdUser(idUser, (err, datosPurchases) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosPurchases)
        }
    })
})

// UPDATE STATE BY ID
exports.updateStateById = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { state } = req.body

    if(state != "Pagado" && state != "Pendiente" && state != "Cancelado"){
        next(new AppError("Estado inválido", 400))
    } else{
        await purchasesModel.updateStateById(id, state, async (err, datosUpdatedPurchase) => {
            if(err){
                next(new AppError(err, 404))
            } else{

                const user = await usersModel.findById(datosUpdatedPurchase.idUser)
                req.session.userLogued.data = user

                res.status(200).json({purchaseData: datosUpdatedPurchase, userData: user})
            }
        })
    }
})