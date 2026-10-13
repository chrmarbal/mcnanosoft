const purchasesModel = require("../models/purchases.model")
const usersModel = require("../models/users.model")
const AppError = require("../utils/AppError")
require("dotenv").config()
const Stripe = require("stripe")
const stripe = new Stripe(process.env.STRIPE_PRIVATE_API_KEY)

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
    const purchase = await purchasesModel.findById(id)
    const currentUser = req.session?.userLogued?.data
    if(!purchase){
        next(new AppError("No se ha encontrado la compra", 404))
    } else if(!currentUser || (String(currentUser._id) !== String(purchase.idUser) && currentUser.profile !== "Administrador")){
        next(new AppError("No tienes permiso para consultar esta compra", 403))
    } else{
        res.status(200).json(purchase)
    }
})

// FIND BY ID USER
exports.findPurchaseByIdUser = wrapAsync(async (req, res, next) => {
    const { idUser } = req.params
    const currentUser = req.session?.userLogued?.data
    if(!currentUser || (String(currentUser._id) !== String(idUser) && currentUser.profile !== "Administrador")){
        next(new AppError("No tienes permiso para consultar estas compras", 403))
        return
    }
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

    const purchase = await purchasesModel.findById(id)
    if(!purchase){
        next(new AppError("No se ha encontrado la compra", 404))
        return
    }

    const currentUser = req.session?.userLogued?.data
    if(!currentUser || (String(currentUser._id) !== String(purchase.idUser) && currentUser.profile !== "Administrador")){
        next(new AppError("No tienes permiso para actualizar esta compra", 403))
        return
    }

    if(state != "Pagado" && state != "Pendiente" && state != "Cancelado"){
        next(new AppError("Estado inválido", 400))
    } else if(state === "Pagado"){
        if(!purchase.stripeSessionId){
            next(new AppError("La compra no tiene una sesión de pago de Stripe asociada", 400))
            return
        }

        const stripeSession = await stripe.checkout.sessions.retrieve(purchase.stripeSessionId)
        if(stripeSession.payment_status !== "paid" || stripeSession.metadata?.purchaseId !== String(purchase._id)){
            next(new AppError("Stripe todavía no confirma el pago", 400))
            return
        }

        await updatePurchaseState()
    } else{
        await updatePurchaseState()
    }

    async function updatePurchaseState(){
        await purchasesModel.updateStateById(id, state, async (err, datosUpdatedPurchase) => {
            if(err){
                next(new AppError(err, 404))
            } else{
                const user = await usersModel.findById(datosUpdatedPurchase.idUser)
                if(String(currentUser._id) === String(user._id)){
                    req.session.userLogued.data = user
                }
                res.status(200).json({purchaseData: datosUpdatedPurchase, userData: user})
            }
        })
    }
})