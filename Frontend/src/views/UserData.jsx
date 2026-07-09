import { useContext, useState } from 'react'
import { userContext } from '../context/UserContext'
import { useSendRequest } from '../components/SendRequest'
import Paper from '@mui/material/Paper'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import "../css/UserData.css"
import EditUserData from '../components/EditUserData'
import { useNavigate } from 'react-router-dom'

function UserData() {
    const go = useNavigate()

    const { userData, setUserData } = useContext(userContext)
    const [showConfirm, setShowConfirm] = useState(false)
    const [editUser, setEditUser] = useState(false)
    const sendRequest = useSendRequest()

    const logout = async () => {
        const response = await sendRequest("get", "", "/users/logout", "/")
        if(response.status == 200){
            setUserData(null)
        }
    }

    const handleConfirm = () => {
        if(!showConfirm){
          setShowConfirm(true)
        } else{
          setShowConfirm(false)
          setProjectToDelete({})
        }
    }

    const deleteAccount = async () => {
        const response = await sendRequest("delete", "", "/users/" + userData.data._id)
        if(response.status == 200){
            setUserData(null)
            go("/")
        }
    }

  return (
    <>
        <Nav/>
        {userData && userData.data ? <div id="userData">
            <div id="content-userData">
                <div>
                    {userData.data.profilePicture ? <img src={"https://localhost:3016/" + userData.data.profilePicture} alt="Profile Picture" draggable={false}/> : userData.data.picture ? <img src={userData.data.picture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                    <p>{userData.data.username}</p>
                    {!userData.data.oAuth && userData.data.profile != "Administrador" ? <button onClick={() => setEditUser(true)}><i className="fa-solid fa-pencil"></i>Editar Cuenta</button> : ""}
                </div>

                {editUser ? <EditUserData userData={userData.data} setEditUser={setEditUser}/> : <Paper elevation={3} style={{color: "#cfcfcf"}} className="userData">
                    <h3>Datos Personales</h3>
                    {userData.data.firstName ? <p>Nombre: {userData.data.firstName}</p> : ""}
                    {userData.data.lastName ? <p>Apellidos: {userData.data.lastName}</p> : ""}
                    <p>Correo Electrónico: {userData.data.email}</p>
                </Paper>}
            </div>
            <div id="user-controls">
                <button onClick={logout}>Cerrar Sesión</button>
                {!userData.data.oAuth && userData.data.profile != "Administrador" ? <button onClick={() => setShowConfirm(true)}>Borrar Cuenta</button> : ""}
            </div>
        </div> : ""}

        {showConfirm && (
            <div className="modalContainer">
                <div className="modalContent">
                <p>¿Estás seguro de que quieres eliminar tu cuenta?</p>
                <button onClick={deleteAccount}>Sí, Eliminar</button>
                <button onClick={handleConfirm}>Cancelar</button>
                </div>
            </div>
        )}
        <Footer/>
    </>
  )
}

export default UserData