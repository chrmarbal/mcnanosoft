import React, { createContext } from 'react'
import { Slide, toast } from 'react-toastify'

export const toastContext = createContext()

export const ToastProvider = ({ children }) => {
    
  const mostrarToast = (mensaje, tipo = 'success') => {
    let options = {
      position: "bottom-right",
      autoClose: 2000,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      theme: "dark",
      transition: Slide
    }

    toast[tipo](mensaje, options)
  }

  return (
    <toastContext.Provider value={{ mostrarToast }}>
      {children}
    </toastContext.Provider>
  )
}