require("dotenv").config()
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_PRIVATE_API_KEY)
const AppError = require("../utils/AppError")
const purchasesModel = require("../models/purchases.model")
const usersModel = require("../models/users.model")
const projectsModel = require("../models/projects.model")
const Cart = require("../models/cart.model")

exports.createCheckoutSession = async (req, res, next) => {
    try {
        const sessionUser = req.session?.userLogued?.data
        if (!sessionUser?._id) return next(new AppError("Debes iniciar sesión para comprar", 401))

        const user = await usersModel.findById(sessionUser._id)
        if (!user) return next(new AppError("Usuario no encontrado", 404))

        const cartItems = new Cart(req.session.cart || {}).getItems()
        if (!cartItems.length) return next(new AppError("El carrito está vacío", 400))

        const libraryIds = new Set((user.library || []).map(entry => String(entry.idProject || entry)))
        const purchaseLines = []
        const checkoutItems = []
        let total = 0

        for (const cartItem of cartItems) {
            const project = await projectsModel.findById(cartItem.item._id)
            if (!project || project.deleted) return next(new AppError("Uno de los proyectos ya no está disponible", 400))
            if (libraryIds.has(String(project._id))) return next(new AppError("Ya tienes uno de los proyectos del carrito", 400))

            const price = project.price === "FREE"
                ? 0
                : Number.parseFloat(String(project.price).replace(/[^\d.,]/g, "").replace(",", "."))
            if (!Number.isFinite(price) || price < 0) return next(new AppError("Precio de proyecto inválido", 400))

            total += price
            purchaseLines.push({ idProject: project._id, amount: price })
            checkoutItems.push({ project, price })
        }

        const newPurchase = {
            idUser: user._id,
            lines: purchaseLines,
            purchased_at: new Date(),
            pay_method: "Credit Card",
            state: "Pendiente",
            amount: total
        }

        const purchase = await purchasesModel.createPurchase(newPurchase)

        const paidItems = checkoutItems.filter(item => item.price > 0)
        if(paidItems.length === 0){
            await purchasesModel.updateStateById(purchase._id, "Pagado")
            const updatedUser = await usersModel.findById(user._id)
            req.session.userLogued.data = updatedUser
            const emptyCart = new Cart({})
            emptyCart.clear()
            req.session.cart = emptyCart
            return res.status(200).json({ freeAcquisition: true, purchaseId: purchase._id, userData: updatedUser })
        }

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: paidItems.map(({ project, price }) => ({
                price_data: {
                    currency: 'eur',
                    product_data: { name: project.name },
                    unit_amount: Math.round(price * 100),
                },
                quantity: 1,
            })),
            metadata: { purchaseId: String(purchase._id) },
            success_url: 'https://localhost:5173/payment/success',
            cancel_url: 'https://localhost:5173/payment/cancel',
        })

        await purchasesModel.findByIdAndUpdate(purchase._id, { stripeSessionId: stripeSession.id })

        res.status(200).json({ url: stripeSession.url, purchaseId: purchase._id })
    } catch (error) {
        next(new AppError(error.message || error, 500))
    }
}