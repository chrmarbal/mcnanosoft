import React, { useContext, useEffect, useState } from 'react'
import { TextField, Autocomplete, Box, Avatar, Typography } from '@mui/material'
import axios from 'axios'
import "../../css/users/New.css"
import { toastContext } from '../../context/ToastContext'
import { Link, useNavigate } from 'react-router-dom'
import StarBorder from '../../components/shared/StarBorder'
import { userContext } from '../../context/UserContext'

function New() {

    const go = useNavigate()
    const { mostrarToast } = useContext(toastContext)
    const { userData } = useContext(userContext)

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
                mostrarToast("Usuario Creado Correctamente", "success")
                go("/")
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
        if(!userData){
            go("/login")
        } else if(userData && userData.data && userData.data.profile != "Administrador"){
            go("/")
        }
    }, [])

  return (
    <>
        <div id="newUserContainer">
            <h1>Crear Usuario</h1>

            <div className="controls">
                <Link to="/users"><i className="fa-solid fa-reply"></i> Volver</Link>
            </div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="firstName">Nombre</label>
                <br />
                <TextField className="newUserText" size="small" onChange={handleFirstName} variant="outlined" required></TextField>

                <br /><br />

                <label htmlFor="lastName">Apellidos</label>
                <br />
                <TextField className="newUserText" size="small" onChange={handleLastName} variant="outlined" required></TextField>

                <br /><br />

                <label htmlFor="username">Nombre de Usuario</label>
                <br />
                <TextField className="newUserText" size="small" onChange={handleUsername} variant="outlined" required></TextField>

                <br /><br />

                <label htmlFor="email">Correo Electrónico</label>
                <br />
                <TextField className="newUserText" size="small" type="email" onChange={handleEmail} variant="outlined" required></TextField>

                <br /><br />

                <label htmlFor="email">Contraseña</label>
                <br />
                <TextField className="newUserText" size="small" type="password" min={8} onChange={handlePassword} variant="outlined" required></TextField>
                {errorPassword ? <>
                    <br />
                    <span className="error">{errorPassword}</span>
                </> : ""}

                <br /><br />

                <label htmlFor="email">Repetir Contraseña</label>
                <br />
                <TextField className="newUserText" size="small" type="password" min={8} onChange={handleRepeatPassword} variant="outlined" required></TextField>
                {errorRepeatPassword ? <>
                    <br />
                    <span className="error">{errorRepeatPassword}</span>
                </> : ""}

                <br /><br />

                <label>Foto de Perfil</label>
                <br />
                <label htmlFor="profilePicture" className="fileInputNewUser">
                    <i className="fa-solid fa-upload"></i>
                    {profilePictureName}
                </label>
                <input type="file" name="profilePicture" id="profilePicture" onChange={handleProfilePicture}/>

                <br />

                <StarBorder color="#cfcfcf">Enviar</StarBorder>
            </form>
        </div>
    </>
  )
}

export default New