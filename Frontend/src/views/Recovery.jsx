import React, { useContext, useState } from 'react'
import { useSendRequest } from '../components/SendRequest'
import { userContext } from '../context/UserContext'
import "../css/Recovery.css"
import { Link } from 'react-router-dom'
import { toastContext } from '../context/ToastContext'
import 'bootstrap/dist/css/bootstrap.min.css'

function Recovery() {

    const sendRequest = useSendRequest()

    const {mostrarToast} = useContext(toastContext)
    const {userData, setUserData} = useContext(userContext)

    const [email, setEmail] = useState("")

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if(email){
            const response = await sendRequest("post", {email: email}, "/users/recovery")
            if(response.status == 200){
                const tokenCookie = {
                    token: response.data.token,
                    expires: response.data.expires,
                    email: email
                }
                document.cookie = `token=${JSON.stringify(tokenCookie)}; max-age=300; path=/`
                mostrarToast(response.data.message, "success")
            }
        }
    }

    return (
        <div id="recovery" className="container-fluid p-0 min-vh-100">
            <div className="row h-100 m-0">
                <div id="aside-recovery" className="col-lg-4 col-md-5 p-0 d-none d-md-block">
                    <img src="/imgs/Abstraccion Login.png" alt="Imagen No Disponible" className="img-fluid h-100" draggable={false}/>
                </div>

                <div id="content-recovery" className="col-lg-8 col-md-7 col-12 d-flex align-items-center justify-content-center p-0">
                    <div id="form-recovery" className="p-4">
                        <h1 className="mb-4">RECUPERAR CUENTA</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="campo mb-4">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input type="email" name="email" id="email" onChange={handleEmail}/>
                            </div>

                            <button id="submitRecovery" className="mb-3">Enviar</button>

                            <Link id="link-register" to="/register">¿No tienes cuenta? Regístrate</Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Recovery