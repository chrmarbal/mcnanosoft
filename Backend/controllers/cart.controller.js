const Cart = require("../models/cart.model")
const AppError = require("../utils/AppError")
const projectModel = require("../models/projects.model")
exports.getCart = (req, res, next) => {
    if(!req.session.cart){
        res.status(200).json({
            title: "Carrito",
            products: [],
            totalPrice: 0 
        })
    } else{
        let cart = new Cart(req.session.cart)
        res.status(200).json({
            title: "Carrito",
            products: cart.getItems(),
            totalPrice: cart.totalPrice
        })

    }
}

exports.addItemToCart = async (req, res, next) => {
    const { id } = req.params

    let cart = new Cart(req.session.cart ? req.session.cart : {})

    await projectModel.findProjectById(id, (err, projectFound) => {
        if(err){
            next(new AppError(err, 404))
        } else{
            let addItem = true

            if(cart.getItems().length > 0){
                for (let item of cart.getItems()) {
                    if(item.item._id == projectFound._id){
                        addItem = false
                        break
                    } 
                }
            }

            if(!addItem){
                next(new AppError("Ya tienes este proyecto en el carrito", 400))
            } else{
                cart.add(projectFound, id)
                req.session.cart = cart
                res.status(200).json({
                    title: "Carrito",
                    products: cart.getItems(),
                    totalPrice: cart.totalPrice
                })
            }
        }
    }) 
}

exports.deleteItemFromCart = (req, res, next) => {
    const { id } = req.params
    let cart = new Cart(req.session.cart ? req.session.cart : {})
    cart.remove(id)

    req.session.cart = cart

    res.status(200).json({
        title: "Carrito",
        products: cart.getItems(),
        totalPrice: cart.totalPrice
    })
}

exports.clearCart = (req, res, next) => {
    let cart = new Cart(req.session.cart ? req.session.cart : {})
    cart.clear()

    req.session.cart = cart
    res.status(200).json({
        title: "Carrito",
        products: cart.getItems(),
        totalPrice: cart.totalPrice
    })
}