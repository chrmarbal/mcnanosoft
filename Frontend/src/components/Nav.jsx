import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userContext } from '../context/UserContext'
import { cartContext } from '../context/CartContext'
import "../css/Nav.css"
import { useSendRequest } from './SendRequest'
import { loadStripe } from '@stripe/stripe-js'

function Nav() {

    let stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_API_KEY

    const stripePromise = loadStripe(stripeKey)

    const go = useNavigate()

    const sendRequest = useSendRequest()
    const { userData } = useContext(userContext)
    const {cartProducts, setCartProducts} = useContext(cartContext) 

    const [isOpen, setIsOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
 
    const removeItemFromCart = async (item) => {
        const response = await sendRequest("get", item, "/cart/remove/" + item._id)
        setCartProducts(response.data)
    }

    const handleCheckout = async () => {
        if(cartProducts && cartProducts.products && cartProducts.products.length > 0){
            if(userData){
                try {
                    const response = await sendRequest("post", { cartItems: cartProducts.products }, "/payment/create-checkout-session")
                
                    if (response.data.url) {
                        document.cookie = `purchaseId=${response.data.purchaseId}; max-age=300; path=/`
                        window.location.href = response.data.url
                    } else {
                      console.log('No se pudo iniciar el checkout')
                    }
                } catch (err) {
                    console.log('Error al conectar con Stripe:', err)
                }
            } else{
                go("/login")
            }
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div id="header">
            <header>
                <Link to="/" draggable="false">
                    <img src="/imgs/Logo MCNANO SOFT.png" alt="Logo MCNANO SOFT" draggable={false}/>
                </Link>
            </header>

            <nav className={isMenuOpen ? 'active' : ''}>
                <ul>
                    <li><Link to="/" draggable="false" onClick={() => setIsMenuOpen(false)}>Inicio</Link></li>
                    <li><Link to="/projects" draggable="false" onClick={() => setIsMenuOpen(false)}>Proyectos</Link></li>
                    {userData && userData.data && userData.data.profile == "Administrador" ? <li><Link to="/users" draggable="false" onClick={() => setIsMenuOpen(false)}>Usuarios</Link></li> : ""}
                    {userData && userData.data ? <li><Link to="/library" draggable="false" onClick={() => setIsMenuOpen(false)}>Biblioteca</Link></li> : ""}
                </ul>
            </nav>

            {userData && userData.data ? <div id="user">
                {userData.data.profilePicture && !userData.data.oAuth ? <>
                    <button id="cartNav" onClick={() => setIsOpen(true)}><i className="fa-solid fa-cart-shopping"></i></button>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile">
                        <img src={"https://localhost:3016/" + userData.data.profilePicture} alt="Profile Picture" draggable={false}/>
                    </Link>
                </> : userData.data.oAuth ? <>
                    <button id="cartNav" onClick={() => setIsOpen(true)}><i className="fa-solid fa-cart-shopping"></i></button>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile" draggable="false">
                        <img src={userData.data.profilePicture} alt="Profile Picture" draggable={false}/>
                    </Link>
                </> : <>
                    <button id="cartNav" onClick={() => setIsOpen(true)}><i className="fa-solid fa-cart-shopping"></i></button>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile" draggable="false">
                        <img src={"https://localhost:3016/imgs/default/user.jpg"} alt="Profile Picture" draggable={false}/>
                    </Link>
                </>}
            </div>: <div id="guest">
                <button id="registerNav"><Link to="/register" draggable="false">Registrarse</Link></button>
                <button id="loginNav"><Link to="/login" draggable="false">Iniciar Sesión</Link></button>
                <button id="cartNav" onClick={() => setIsOpen(true)}><i className="fa-solid fa-cart-shopping"></i></button>
                <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
            </div>}

            <div className={`sideCart ${isOpen ? 'open' : ''}`}>
                <button id="closeCart" onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                <h2>Tu carrito</h2>
                {cartProducts && cartProducts.products && cartProducts.products.length > 0 ? cartProducts.products.map((pr, i) => (
                    <div key={i} className="cartItem">
                        <img src={"https://localhost:3016/" + pr.item.projectIcon} alt="Project Icon" draggable={false}/>
                        <div className="cartItemInfo">
                            <p className="itemName">{pr.item.name}</p>
                            <p className="itemPrice">{pr.price}€</p>
                        </div>
                        <button className="removeBtn" onClick={() => removeItemFromCart(pr.item)}><i className="fa-solid fa-xmark"></i></button>
                    </div>
                )) : <p>Carrito vacío</p>}

                {cartProducts && cartProducts.products && cartProducts.products.length > 0 ? <div className="cartSummary">
                    <div className="cartTotal">
                        <span>Total:</span>
                        <b>{cartProducts.totalPrice}€</b>
                    </div>
                    <button className="checkoutBtn" onClick={handleCheckout}>Finalizar Compra</button>
                </div> : ""}
            </div>

            {/* Capa oscura detrás del carrito para cerrar clicando fuera */}
            {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

        </div>
    )
}

export default Nav