import React, { useEffect, useRef } from 'react'
import "../../css/PaymentResult.css"
import { Link } from 'react-router-dom'
import { useSendRequest } from '../api/SendRequest'

function CancelPayment() {
  const estadoCambiado = useRef(false)

  const sendRequest = useSendRequest()

  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
  }

  const changePayState = async () => {
    const purchaseId = getCookie("purchaseId")
    if (purchaseId) {
      const response = await sendRequest("patch", { state: "Cancelado" }, "/purchases/edit/" + purchaseId)
      if (response.status === 200) {
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
      <i className="fa-solid fa-circle-xmark"></i>
      <div>
        <h1>¡Algo Salió Mal!</h1>
        <p>El proceso de pago fue cancelado. Puedes intentarlo de nuevo o enviar un correo a mcnanosoft.info@gmail.com para contactar con el administrador.</p>
        <Link to="/">Volver al Inicio</Link>
      </div>
    </div>
  )
}

export default CancelPayment