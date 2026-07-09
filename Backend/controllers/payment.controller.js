require("dotenv").config()
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_PRIVATE_API_KEY)
const AppError = require("../utils/AppError")
const purchasesModel = require("../models/purchases.model")
const usersModel = require("../models/users.model")

exports.createCheckoutSession = async (req, res, next) => {
    const { cartItems } = req.body

    const user = await usersModel.findById(req.session.userLogued.data._id)

    for (let item of cartItems) {
        for (let project of user.library) {
            if(item.item._id == project.idProject){
                next(new AppError("No puedes comprar un proyecto que ya tienes!", 400))
            }
        }
    }

    const newPurchase = {
        idUser: req.session.userLogued.data._id,
        lines: [],
        purchased_at: new Date(),
        pay_method: "Credit Card",
        state: "Pendiente",
        amount: req.session.cart.totalPrice
    }

    for (item of cartItems) {
        let line = {}
        line.idProject = item.item._id
        line.amount = item.price
        newPurchase.lines.push(line)
    }

    let purchaseId = ""
    await purchasesModel.createPurchase(newPurchase, async (err, purchaseCreated) => {
        if(err){
            next(new AppError("No se ha podido crear la compra. Desc: " + err, 500))
        } else{
            purchaseId = purchaseCreated._id
            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    line_items: cartItems.map(item => ({
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: item.item.name,
                                // images: item.item.projectIcon ? [`https://localhost:3016/${item.item.projectIcon}`] : [],
                            },
                            unit_amount: Math.round(item.price * 100), // en céntimos
                        },
                        quantity: 1,
                    })),
                    success_url: 'https://localhost:5173/payment/success',
                    cancel_url: 'https://localhost:5173/payment/cancel',
                })
        
                res.json({ url: session.url, purchaseId: purchaseId })
        
            } catch (error) {
                next(new AppError(error, 500))
            }
        }
    })
}