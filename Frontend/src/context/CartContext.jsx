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
  const [isCartLoading, setIsCartLoading] = useState(true)

  const getItems = async () => {
    setIsCartLoading(true)
    try {
      const { data, status } = await axios.get('/cart', { timeout: 15000 })
      if (status === 200) {
        setCartProducts(data)
      }
    } catch (err) {
      console.error('Error cargando carrito:', err)
    } finally {
      setIsCartLoading(false)
    }
  }

  const clearCart = async () => {
    setIsCartLoading(true)
    try {
      const { data, status } = await axios.get('/cart/clearCart', { timeout: 15000 })
      if (status === 200) {
        setCartProducts(data)
      }
    } catch (err) {
      console.error('Error vaciando carrito:', err)
    } finally {
      setIsCartLoading(false)
    }
  }

  useEffect(() => {
    // Al montar, cargamos el carrito
    getItems()
  }, [])

  return (
    <cartContext.Provider value={{ cartProducts, setCartProducts, getItems, clearCart, isCartLoading, setIsCartLoading }}>
      {children}
    </cartContext.Provider>
  )
}