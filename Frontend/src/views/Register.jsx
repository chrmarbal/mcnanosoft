import { useContext, useEffect, useState } from "react"
import "../css/Register.css"
import { Link, useNavigate } from "react-router-dom"
import { userContext } from "../context/UserContext"
import { toastContext } from "../context/ToastContext"
import 'bootstrap/dist/css/bootstrap.min.css'

function Register() {

    const go = useNavigate()

    const {mostrarToast} = useContext(toastContext)
    const {userData, setUserData} = useContext(userContext)

    // ESTADOS FORMULARIO REGISTRO
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [profilePicture, setProfilePicture] = useState("")
    const [profilePictureName, setProfilePictureName] = useState("Selecciona un Archivo")

    const [errorPassword, setErrorPassword] = useState("")
    const [errorRepeatPassword, setErrorRepeatPassword] = useState("")

    const handleFirstName = (e) => {
        setFirstName(e.target.value)
    }

    const handleLastName = (e) => {
        setLastName(e.target.value)
    }

    const handleUsername = (e) => {
        setUsername(e.target.value)
    }

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }

    const handlePassword = (e) => {
        setPassword(e.target.value)
        setErrorPassword(validarPassword(e.target.value))
    }

    const handleRepeatPassword = (e) => {
        setRepeatPassword(e.target.value)
        setErrorRepeatPassword(e.target.value !== password ? "Las contraseñas deben coincidir" : "")
    }

    const handleProfilePicture = (e) => {
        setProfilePicture(e.target.files[0])       
        setProfilePictureName(e.target.files[0].name) 
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const user = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: password
        }

        const formData = new FormData()
        formData.append("user", JSON.stringify(user))
        if(profilePicture != ""){
            formData.append("profilePicture", profilePicture)
        }

        try {
            const response = await axios.post("/users", formData, {headers: {"Content-Type": "multipart/form-data"}})
            if(response.status == 200){
                setUserData(response.data)
                window.location.href = "/"
            } else{
                mostrarToast(response.data, "error")
            }   
        } catch (error) {
            mostrarToast(error.response.data, "error")
        }
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
        if(userData){
            go("/")
        }
    }, [])

    return (
        <div id="register" className="container-fluid p-0 min-vh-100">
            <div className="row h-100 m-0">
                <div id="aside-register" className="col-lg-4 col-md-5 p-0 d-none d-md-block">
                    <img src="/imgs/Abstraccion Login.png" alt="Imagen No Disponible" className="img-fluid h-100" draggable={false}/>
                </div>

                <div id="content-register" className="col-lg-8 col-md-7 col-12 d-flex align-items-center justify-content-center p-0">
                    <div id="form-register" className="p-4">
                        <h1 className="mb-4">REGISTRARSE</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="campos mb-3">
                                <div className="campo">
                                    <label htmlFor="firstName">Nombre</label>
                                    <input type="text" name="firstName" id="firstName" onChange={handleFirstName} required/>
                                </div>

                                <div className="campo">
                                    <label htmlFor="lastName">Apellidos</label>
                                    <input type="text" name="lastName" id="lastName" onChange={handleLastName} required/>
                                </div>
                            </div>

                            <div className="campos mb-3">
                                <div className="campo">
                                    <label htmlFor="userName">Usuario</label>
                                    <input type="text" name="userName" id="userName" onChange={handleUsername} required/>
                                </div>

                                <div className="campo">
                                    <label htmlFor="email">Correo Electrónico</label>
                                    <input type="email" name="email" id="email" onChange={handleEmail} required/>
                                </div>
                            </div>

                            <div className="campos mb-3">
                                <div className="campo">
                                    <label htmlFor="password">Contraseña</label>
                                    <input type="password" min={8} name="password" id="password" onChange={handlePassword} required/>
                                    <span style={{color: "red"}} className="error">{errorPassword ? errorPassword : ""}</span>
                                </div>

                                <div className="campo">
                                    <label htmlFor="repeatPassword">Repetir Contraseña</label>
                                    <input type="password" min={8} name="repeatPassword" id="repeatPassword" onChange={handleRepeatPassword} required/>
                                    <span style={{color: "red"}} className="error">{errorRepeatPassword ? errorRepeatPassword : ""}</span>
                                </div>
                            </div>

                            <div className="campo mb-4" id="fotoPerfil">
                                <label>Foto de Perfil</label>
                                <label htmlFor="profilePicture" id="fileInput"><i className="fa-solid fa-upload"></i>{profilePictureName}</label>
                                <input type="file" name="profilePicture" id="profilePicture" onChange={handleProfilePicture}/>
                            </div>

                            <button id="submitRegister" className="mb-3">Registrarse</button>

                            <Link id="link-login" to="/login">¿Ya tienes cuenta? Inicia Sesión</Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register