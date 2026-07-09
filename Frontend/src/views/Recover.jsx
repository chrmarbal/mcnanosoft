import React, { useContext, useEffect, useState } from 'react'
import { useSendRequest } from '../components/SendRequest'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { userContext } from '../context/UserContext'
import "../css/Recover.css"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toastContext } from '../context/ToastContext'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import 'bootstrap/dist/css/bootstrap.min.css'

function Recover() {

    const go = useNavigate()

    const token = useParams().token

    const sendRequest = useSendRequest()

    const { mostrarToast } = useContext(toastContext)
    const {userData, setUserData} = useContext(userContext)

    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")

    const [errorPassword, setErrorPassword] = useState("")
    const [errorRepeatPassword, setErrorRepeatPassword] = useState("")

    const [showPasswords, setShowPasswords] = useState(false)

    const handlePassword = (e) => {
        setPassword(e.target.value)
        setErrorPassword(validarPassword(e.target.value))
    }

    const handleRepeatPassword = (e) => {
        setRepeatPassword(e.target.value)
        setErrorRepeatPassword(e.target.value !== password ? "Las contraseñas deben coincidir" : "")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const tokenCookie = JSON.parse(getCookie("token"))
        console.log(tokenCookie[0])
        const userEmail = tokenCookie.email
        const response = await sendRequest("patch", {password: password, token: tokenCookie.token, expires: tokenCookie.expires}, "/users/resetAccount/" + userEmail)
        if(response.status == 200){
            mostrarToast("Contraseña Actualizada con Éxito", "success")
            setUserData(response.data)
            go("/")
        }
    }

    const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(";").shift()
    }

    const validarPassword = (password) => {
        const regexMayuscula = /[A-Z]/
        const regexMinuscula = /[a-z]/
        const regexNumero = /\d/
        const regexCarEsp = /[!@#$%^&*(),.?":{}|<>_=+\-]/
    
        if (!regexMayuscula.test(password)){
          return "La contraseña debe tener al menos una mayúscula"
        } else if(!regexMinuscula.test(password)){
          return "La contraseña debe tener al menos una minúscula"
        } else if(!regexNumero.test(password)){
          return "La contraseña debe tener al menos un número"
        } else if(!regexCarEsp.test(password)){
          return "La contraseña debe tener al menos un carácter especial"
        } else{
          return ""
        }
    }

    useEffect(() => {
        const tokenCookie = getCookie("token")
        if(tokenCookie && tokenCookie.token != token){
            mostrarToast("Enlace de Recuperación de cuenta inválido", "error")
            go("/login")
        } else if(!tokenCookie){
            mostrarToast("Enlace de Recuperación de cuenta expirado", "error")
            go("/login")
        }
    }, [])

    return (
        <div id="recover" className="container-fluid p-0 min-vh-100">
            <div className="row h-100 m-0">
                <div id="aside-recover" className="col-lg-4 col-md-5 p-0 d-none d-md-block">
                    <img src="/imgs/Abstraccion Login.png" alt="Imagen No Disponible" className="img-fluid h-100" draggable={false}/>
                </div>

                <div id="content-recover" className="col-lg-8 col-md-7 col-12 d-flex align-items-center justify-content-center p-0">
                    <div id="form-recover" className="p-4">
                        <h1 className="mb-4">RECUPERAR CUENTA</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="campo mb-4">
                                <label htmlFor="password">Contraseña Nueva</label>
                                <TextField type={showPasswords ? "text" : "password"} min={8} name="password" id="password" onChange={handlePassword} sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                    '& .MuiOutlinedInput-root fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    },
                                    '& .MuiOutlinedInput-root:hover fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    }
                                }}/>
                                <span style={{color: "red", display: "block", minHeight: "15px"}} className="error">{errorPassword ? errorPassword : ""}</span>
                            </div>

                            <div className="campo mb-4">
                                <label htmlFor="repeatPassword">Repetir Contraseña Nueva</label>
                                <TextField type={showPasswords ? "text" : "password"} min={8} name="repeatPassword" id="repeatPassword" onChange={handleRepeatPassword} sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                    '& .MuiOutlinedInput-root fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    },
                                    '& .MuiOutlinedInput-root:hover fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                        borderRadius: '10px',
                                        borderColor: '#191860',
                                    }
                                }}/>
                                <span style={{color: "red", display: "block", minHeight: "15px"}} className="error">{errorRepeatPassword ? errorRepeatPassword : ""}</span>
                            </div>

                            <div className="showPasswordsContainer mb-4">
                                <input type="checkbox" checked={showPasswords} name="showPasswords" id="showPasswords" onChange={() => setShowPasswords(sp => !sp)}/>
                                <label htmlFor="showPasswords">Mostrar Contraseñas</label>
                            </div>

                            <button id="submitRecover" className="mb-3">Enviar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Recover