// src/context/CartContext.jsx
import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'

export const cartContext = createContext()

export const Cart = ({ children }) => {
  const [cartProducts, setCartProducts] = useState({
    title: '',
    products: [],
    totalPrice: 0
  })

  // 1) Carga inicial del carrito
  const getItems = async () => {
    try {
      const { data, status } = await axios.get('/cart')
      if (status === 200) {
        setCartProducts(data)
      }
    } catch (err) {
      console.error('Error cargando carrito:', err)
    }
  }

  // 2) Función para vaciar el carrito
  const clearCart = async () => {
    try {
      const { data, status } = await axios.get('/cart/clearCart')
      if (status === 200) {
        setCartProducts(data)
      }
    } catch (err) {
      console.error('Error vaciando carrito:', err)
    }
  }

  useEffect(() => {
    // Al montar, cargamos el carrito
    getItems()
  }, [])

  return (
    <cartContext.Provider value={{ cartProducts, setCartProducts, getItems, clearCart }}>
      {children}
    </cartContext.Provider>
  )
}