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
    await ratingsModel.findAll((err, datosRatings) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosRatings)
        }
    })
})

// FIND BY ID
exports.findRatingById = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await ratingsModel.findRatingById(id, (err, datosRating) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosRating)
        }
    })
})

// FIND BY ID USER
exports.findRatingByIdUser = wrapAsync(async (req, res, next) => {
    const { idUser } = req.params
    await ratingsModel.findRatingByIdUser(idUser, (err, datosRating) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            res.status(200).json(datosRating)
        }
    })
})

// FIND BY ID PROJECT
exports.findRatingByIdProject = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    await ratingsModel.findRatingByIdProject(id, async (err, datosRating) => {
        if(err){
            res.status(204)
        } else{

            const datosUsers = await usersModel.find({active: true, profile: "Usuario"})

            const result = {
                ratingData: datosRating,
                usersData: datosUsers
            }

            res.status(200).json(result)
        }
    })
})

// CREATE RATING
exports.createRating = wrapAsync(async (req, res, next) => {
    const { idUser, idProject, rating, opinion } = req.body

    let validado = false
    const datosUser = await usersModel.findById(idUser)
    for (let project of datosUser.library) {
        if(idProject == project.idProject){
            validado = true
            break
        }
    }

    

    if(validado){

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

            await ratingsModel.createRating(newRating, (err, datosCreatedRating) => {   
                if(err){
                    next(new AppError(err, 400))
                } else{
                    res.status(200).json(datosCreatedRating)
                }
            })
        } else{
            next(new AppError("No puedes hacer más de una valoración sobre un mismo proyecto", 400))
        }
    } else{
        next(new AppError("No puedes poner una opinión de un proyecto que no has adquirido", 400))
    }
})

// CHANGE APROVED
exports.changeAproved = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { aproved } = req.body
    
    await ratingsModel.changeAproved(id, aproved, async (err, datosAprovedRating) => {
        if(err){
            next(new AppError(err, 500))
        } else{
            res.status(200).json(datosAprovedRating)
        }
    })
})