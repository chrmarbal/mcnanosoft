import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userContext } from '../../context/UserContext'
import { cartContext } from '../../context/CartContext'
import { useSendRequest } from '../api/SendRequest'
import CartSkeleton from '../loaders/CartSkeleton'
import "../../css/Nav.css"

function Nav() {

    const go = useNavigate()

    const { userData, setUserData } = useContext(userContext)
    const { cartProducts, setCartProducts, clearCart, getItems, isCartLoading, setIsCartLoading } = useContext(cartContext)
    const sendRequest = useSendRequest()

    const [isOpen, setIsOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const removeItemFromCart = async (item) => {
        setIsCartLoading(true)
        try {
            const response = await sendRequest("get", item, "/cart/remove/" + item._id)
            if(response?.status === 200){
                setCartProducts(response.data)
            }
        } finally {
            setIsCartLoading(false)
        }
    }

    const handleCheckout = async () => {
        if(!cartProducts?.products?.length) return
        if(!userData){
            go("/login")
            return
        }

        setIsCartLoading(true)
        try {
            const response = await sendRequest("post", { cartItems: cartProducts.products }, "/payment/create-checkout-session")
            if(response?.data?.freeAcquisition){
                setUserData(ud => ({ ...ud, data: response.data.userData }))
                await clearCart()
                go("/library")
                return
            }
            if(response?.status === 200 && response.data?.url){
                document.cookie = `purchaseId=${response.data.purchaseId}; max-age=300; path=/`
                window.location.href = response.data.url
            }
        } finally {
            setIsCartLoading(false)
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

            <div className="header-actions">
            <button id="cartNav" onClick={() => { setIsOpen(true); getItems() }} aria-label="Abrir carrito">
                <i className="fa-solid fa-cart-shopping"></i>
                {cartProducts?.products?.length > 0 && <span className="cart-count">{cartProducts.products.length}</span>}
            </button>

            {userData && userData.data ? <div id="user">
                {userData.data.profilePicture && !userData.data.oAuth ? <>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile">
                        <img src={"https://localhost:3016/" + userData.data.profilePicture} alt="Profile Picture" draggable={false}/>
                    </Link>
                </> : userData.data.oAuth ? <>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile" draggable="false">
                        <img src={userData.data.profilePicture} alt="Profile Picture" draggable={false}/>
                    </Link>
                </> : <>
                    <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
                    <Link to="/profile" draggable="false">
                        <img src={"https://localhost:3016/imgs/default/user.jpg"} alt="Profile Picture" draggable={false}/>
                    </Link>
                </>}
            </div>: <div id="guest">
                <button id="registerNav"><Link to="/register" draggable="false">Registrarse</Link></button>
                <button id="loginNav"><Link to="/login" draggable="false">Iniciar Sesión</Link></button>
                <button className="nav-menu-toggle" onClick={toggleMenu}><i className="fa-solid fa-bars"></i></button>
            </div>}
            </div>

            <div className={`sideCart ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
                <button id="closeCart" onClick={() => setIsOpen(false)} aria-label="Cerrar carrito"><i className="fa-solid fa-xmark"></i></button>
                <h2>Tu carrito</h2>
                {isCartLoading ? <CartSkeleton /> : cartProducts?.products?.length > 0 ? cartProducts.products.map((product, index) => (
                    <div key={product.item._id || index} className="cartItem">
                        <img src={`https://localhost:3016/${product.item.projectIcon}`} alt="" draggable={false}/>
                        <div className="cartItemInfo">
                            <p className="itemName">{product.item.name}</p>
                            <p className="itemPrice">{product.item.price === "FREE" ? "Gratis" : `${product.price}€`}</p>
                        </div>
                        <button className="removeBtn" onClick={() => removeItemFromCart(product.item)} aria-label={`Quitar ${product.item.name}`}><i className="fa-solid fa-xmark"></i></button>
                    </div>
                )) : <p>Carrito vacío</p>}

                {cartProducts?.products?.length > 0 && <div className="cartSummary">
                    <div className="cartTotal"><span>Total:</span><b>{cartProducts.totalPrice}€</b></div>
                    <button className="checkoutBtn" onClick={handleCheckout}>Finalizar compra</button>
                </div>}
            </div>

            {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

        </div>
    )
}

export default Nav