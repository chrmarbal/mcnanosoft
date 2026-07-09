import React, { useContext, useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import { useSendRequest } from './SendRequest'
import { toastContext } from '../context/ToastContext'
import { userContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function EditUserData({ userData, setEditUser }) {
    const go = useNavigate()

    const { setUserData } = useContext(userContext)
    const { mostrarToast } = useContext(toastContext)

    const [username, setUsername] = useState(userData.username)
    const [firstName, setFirstName] = useState(userData.firstName)
    const [lastName, setLastName] = useState(userData.lastName)
    const [email, setEmail] = useState(userData.email)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [repeatNewPassword, setRepeatNewPassword] = useState("")
    
    const [profilePicture, setProfilePicture] = useState("")
    const [profilePictureName, setProfilePictureName] = useState("Selecciona un Archivo")

    const [errorPassword, setErrorPassword] = useState("")
    const [errorRepeatPassword, setErrorRepeatPassword] = useState("")


    const handleUserName = (e) => {
        setUsername(e.target.value)
    }

    const handleFirstName = (e) => {
        setFirstName(e.target.value)
    }

    const handleLastName = (e) => {
        setLastName(e.target.value)
    }

    const handleEmail = (e) => {
        setEmail(e.target.value)
    }

    const handleCurrentPassword = (e) => {
        setCurrentPassword(e.target.value)
    }

    const handleNewPassword = (e) => {
        setNewPassword(e.target.value)
        setErrorPassword(validarPassword(e.target.value))
    }

    const handleRepeatNewPassword = (e) => {
        setRepeatNewPassword(e.target.value)
        setErrorRepeatPassword(e.target.value !== newPassword ? "Las contraseñas no coinciden" : "")
    }

    const handleProfilePicture = (e) => {
        setProfilePicture(e.target.files[0])
        setProfilePictureName(e.target.files[0].name)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const updatedUser = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email
        }

        if(currentPassword != ""){
            updatedUser.currentPassword = currentPassword
            updatedUser.newPassword = newPassword
        }

        const formData = new FormData()
        formData.append("user", JSON.stringify(updatedUser))

        if(profilePicture != ""){
            formData.append("profilePicture", profilePicture)
        }

        const response = await axios.patch("/users/edit/" + userData._id, formData, {headers: {"Content-Type": "multipart/form-data"}})

        if(response.status == 200){
            mostrarToast("Cuenta Actualizada Correctamente", "success")
            setUserData(ud => ud.data = response.data)

            window.location.href = "/"
        }
    }

    // FUNCIÓN VALIDAR CONTRASEÑAS
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

  return (
    <Paper elevation={3} className="editUserData" style={{color: "#cfcfcf"}}>
        <h3>Editar Cuenta</h3>
        <form onSubmit={handleSubmit}>
            <div className="campos">
                <div className="campo">
                    <label>Nombre</label>
                    <input type="text" defaultValue={userData.firstName} id="userData-nombre" onChange={handleFirstName}/>
                </div>

                <div className="campo">
                    <label>Apellidos</label>
                    <input type="text" defaultValue={userData.lastName} id="userData-apellidos" onChange={handleLastName}/>
                </div>
            </div>

            <div className="campos">
                <div className="campo">
                    <label>Nombre de Usuario</label>
                    <input type="text" defaultValue={userData.username} id="userData-username" onChange={handleUserName}/>
                </div>

                <div className="campo">
                    <label>Correo Electrónico</label>
                    <input type="email" defaultValue={userData.email} id="userData-email" onChange={handleEmail}/>
                </div>
            </div>

            <div className="campos">
                <div className="campo" id="currentPasswordContainer">
                    <label>Contraseña Actual</label>
                    <input type="password" min={8} id="userData-cpass" onChange={handleCurrentPassword}/>
                </div>
            </div>

            <div className="campos">
                <div className="campo">
                    <label>Contraseña Nueva</label>
                    <input type="password" min={8} id="userData-npass" onChange={handleNewPassword}/>
                    <span style={{color: "#e74c3c"}} className="error">{errorPassword ? errorPassword : ""}</span>
                </div>

                <div className="campo">
                    <label>Repetir Nueva Contraseña</label>
                    <input type="password" min={8} id="userData-rnpass" onChange={handleRepeatNewPassword}/>
                    <span style={{color: "#e74c3c"}} className="error">{errorRepeatPassword ? errorRepeatPassword : ""}</span>
                </div>
            </div>

            <div id="userData-profilePicture" className="campo">
                <label>Foto de Perfil</label>
                <label htmlFor="userData-profilePictureInput"><i className="fa-solid fa-upload"></i>{profilePictureName}</label>
                <input type="file" name="profilePicture" id="userData-profilePictureInput" onChange={handleProfilePicture}/>
            </div>

            <button>Actualizar</button>
        </form>
        <span id="userData-cancelBtn" onClick={() => setEditUser(false)}>Cancelar</span>
    </Paper>
  )
}

export default EditUserData