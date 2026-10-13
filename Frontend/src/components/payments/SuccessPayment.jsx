// SuccessPayment.jsx
import React, { useContext, useEffect, useRef } from 'react'
import "../../css/PaymentResult.css"
import { Link } from 'react-router-dom'
import { cartContext } from '../../context/CartContext'
import { userContext } from '../../context/UserContext'
import { useSendRequest } from '../api/SendRequest'

function SuccessPayment() {
  const estadoCambiado = useRef(false)

  // Importamos clearCart directamente del contexto
  const { clearCart } = useContext(cartContext)
  const { setUserData } = useContext(userContext)
  const sendRequest = useSendRequest()

  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
  }

  const changePayState = async () => {
    const purchaseId = getCookie("purchaseId")
    if (purchaseId) {
      const response = await sendRequest("patch", { state: "Pagado" }, "/purchases/edit/" + purchaseId)
      if (response.status === 200) {
        // Actualizamos userData con el usuario que devuelve el endpoint
        setUserData(ud => ({ ...ud, data: response.data.userData }))
        clearCart()
        // Borramos la cookie
        document.cookie = "purchaseId=; max-age=0; path=/"
      }
    }
  }

  useEffect(() => {
    if (estadoCambiado.current) return
    changePayState()

    estadoCambiado.current = true
  }, [])

  return (
    <div className="paymentResult">
      <i className="fa-solid fa-circle-check"></i>
      <div>
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido se ha procesado correctamente.</p>
        <a href="https://localhost:5173">Volver al Inicio</a>
      </div>
    </div>
  )
}

export default SuccessPayment