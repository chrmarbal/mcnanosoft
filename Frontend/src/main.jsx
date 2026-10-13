import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ParallaxProvider } from 'react-scroll-parallax'
import './index.css'
import App from './App.jsx'

import axios from "axios"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { UserProvider } from './context/UserContext.jsx'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.js"

// RUTA PARA ACCEDER AL BACKEND
let host = import.meta.env.VITE_BASE_URL_BACKEND

// CONFIGURACIONES AXIOS
window.axios = axios
window.axios.defaults.baseURL = host
window.axios.defaults.headers.common['Accept'] = 'application/json'
window.axios.defaults.headers.common['Content-Type'] = 'application/json'
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ParallaxProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </ParallaxProvider>
  </StrictMode>,
)
