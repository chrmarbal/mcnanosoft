const ratingsModel = require("../models/ratings.model")
const AppError = require("../utils/AppError")
const usersModel = require("../models/users.model")

// Función Para Capturar Errores Asíncronos
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => {
            next(e)
        })
    }
}

// #region CRUD RATINGS
// <============ CRUD RATINGS ============>

// FIND ALL
exports.findAllRatings = wrapAsync(async (req, res, next) => {
    try {
        const datosRatings = await ratingsModel.findAll()
        res.status(200).json(datosRatings)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// FIND BY ID
exports.findRatingById = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    try {
        const datosRating = await ratingsModel.findRatingById(id)
        res.status(200).json(datosRating)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// FIND BY ID USER
exports.findRatingByIdUser = wrapAsync(async (req, res, next) => {
    const { idUser } = req.params
    try {
        const datosRating = await ratingsModel.findRatingByIdUser(idUser)
        res.status(200).json(datosRating)
    } catch (err) {
        next(new AppError(err.message || err, 404))
    }
})

// FIND BY ID PROJECT
exports.findRatingByIdProject = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    let datosRating
    try {
        datosRating = await ratingsModel.findRatingByIdProject(id)
    } catch (err) {
        res.status(204)
        return
    }

    const datosUsers = await usersModel.find({active: true, profile: "Usuario"})
    const result = {
        ratingData: datosRating,
        usersData: datosUsers
    }
    res.status(200).json(result)
})

// CREATE RATING
exports.createRating = wrapAsync(async (req, res, next) => {
    const { idUser, idProject, rating, opinion } = req.body

    const user = await usersModel.findById(idUser)
    const ownsProject = user?.library?.some(item =>
        String(item.idProject || item) === String(idProject)
    )

    if(!ownsProject){
        next(new AppError("No puedes poner una opinión de un proyecto que no has adquirido", 400))
        return
    }

    const ratings = await ratingsModel.find({aproved: "Aprobado"})

    let addRating = true
    for (let rating of ratings) {
        if(rating.idUser == idUser && rating.idProject == idProject){
            addRating = false
        }
    }

    if(addRating){
        const newRating = {
            idUser: idUser,
            idProject: idProject,
            rating: rating,
            opinion: opinion
        }

        try {
            const datosCreatedRating = await ratingsModel.createRating(newRating)
            res.status(200).json(datosCreatedRating)
        } catch (err) {
            next(new AppError(err.message || err, 400))
        }
    } else{
        next(new AppError("No puedes hacer más de una valoración sobre un mismo proyecto", 400))
    }
})

// CHANGE APROVED
exports.changeAproved = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { aproved } = req.body
    
    try {
        const datosAprovedRating = await ratingsModel.changeAproved(id, aproved)
        res.status(200).json(datosAprovedRating)
    } catch (err) {
        next(new AppError(err.message || err, 500))
    }
})