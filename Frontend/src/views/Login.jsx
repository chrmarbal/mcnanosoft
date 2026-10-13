import React, { useContext, useState } from 'react'
import { useSendRequest } from '../components/api/SendRequest'
import { userContext } from '../context/UserContext'
import "../css/Login.css"
import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

function Login() {
    const sendRequest = useSendRequest()
    const { setUserData } = useContext(userContext)

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")

    const handleUserName = (e) => {
        setUserName(e.target.value)
    }

    const handlePassword = (e) => {
        setPassword(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const user = {
            username: userName,
            password: password
        }

        const response = await sendRequest("post", user, "/users/login")
        if(response.status == 200){
            setUserData(response.data)
            window.location.href = "/"
        }
    }

    return (
        <div id="login" className="container-fluid p-0 min-vh-100">
            <div className="row h-100 m-0">
                <div id="aside-login" className="col-lg-4 col-md-5 p-0 d-none d-md-block">
                    <img src="/imgs/Abstraccion Login.png" alt="Imagen No Disponible" className="img-fluid h-100" draggable={false}/>
                </div>

                <div id="content-login" className="col-lg-8 col-md-7 col-12 d-flex align-items-center justify-content-center p-0">
                    <div id="form-login" className="p-4">
                        <h1 className="mb-4">INICIAR SESIÓN</h1>

                        <div className="auth flex-column flex-sm-row">
                            <button className="mb-3 mb-sm-0" onClick={() => {window.location.href = "https://localhost:3016/auth/google"}}>
                                <img src="/imgs/Logo Google.png" alt="Logo Google" draggable={false}/>Continuar con Google
                            </button>
                            <button onClick={() => {window.location.href = "https://localhost:3016/auth/github"}}>
                                <img src="/imgs/Logo GitHub.png" alt="Logo GitHub" draggable={false}/> Continuar con GitHub
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="campo mb-3">
                                <label htmlFor="userName">Usuario</label>
                                <input type="text" name="userName" id="userName" onChange={handleUserName}/>
                            </div>

                            <div className="campo">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" min={8} name="password" id="password" onChange={handlePassword}/>
                                <div className="links mt-2">
                                    <Link to="/register">Registrarse</Link>
                                    <Link to="/recovery">¿Has olvidado tu contraseña?</Link>
                                </div>
                            </div>

                            <button id="submitLogin" className="mt-4">Entrar</button>
                            <Link to="/">Ir a Inicio</Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login