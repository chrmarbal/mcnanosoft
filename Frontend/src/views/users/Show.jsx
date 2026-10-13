import React, { useContext, useEffect, useState } from 'react'
import { userContext } from '../../context/UserContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSendRequest } from '../../components/api/SendRequest'
import Paper from '@mui/material/Paper'
import "../../css/users/Show.css"
import { toastContext } from '../../context/ToastContext'

function Show() {

    const [user, setUser] = useState({})
  const [ownedProjects, setOwnedProjects] = useState([])
    const [userToDelete, setUserToDelete] = useState({})
    const [showConfirm, setShowConfirm] = useState(false)

    const { mostrarToast } = useContext(toastContext)

    const { userData } = useContext(userContext)
    const userName = useParams().username
    const sendRequest = useSendRequest()
    const go = useNavigate()

    const getData = async () => {
        const response = await sendRequest("get", "", "/users")
        if(response.status == 200){
            for (let user of response.data) {
                if(user.username == userName){
                    setUser(user)
                  if(user.library?.length){
                    const projectsResponse = await sendRequest("get", "", "/projects")
                    if(projectsResponse?.status === 200){
                      const ownedIds = new Set(user.library.map(entry => String(entry.idProject || entry)))
                      setOwnedProjects(projectsResponse.data.filter(project => ownedIds.has(String(project._id))))
                    }
                  }
                    break
                }
            }
        }
    }

    const handleConfirm = (user) => {
        if(!showConfirm){
          setShowConfirm(true)
          setUserToDelete(user)
        } else{
          setShowConfirm(false)
          setUserToDelete({})
        }
      }
  
      const deleteUser = async () => {
        if(userToDelete){
          console.log(userToDelete)
          const response = await sendRequest("delete", "", "/users/" + userToDelete._id, "", true)
          if(response.status == 200){
            mostrarToast("Usuario Desactivado Correctamente", "success")
            handleConfirm(userToDelete)
            getData()
          }
        }
      }
  
      const reviveUser = async (user) => {
        const userData = user
        userData.active = true
        const response = await sendRequest("patch", userData, "/users/revive/" + user._id)
        if(response.status == 200){
          mostrarToast("Usuario Reactivado Correctamente", "success")
          getData()
        }
      }

    useEffect(() => {
        if(!userData){
            go("/login")
        } else if(userData && userData.data.profile != "Administrador"){
            go("/")
        } else{
            getData()
        }
    }, [])

  return (
    <>
        <div id="showUserContainer">
            <h1>Detalles Usuario</h1>
            <div className="controls">
                <Link to="/users"><i className="fa-solid fa-reply"></i> Volver</Link>
                {user.active ? <button id="deleteProjectBtn" onClick={() => handleConfirm(user)}>
                    <i className="fa-solid fa-trash"></i>
                </button> : <button id="reviveProjectBtn" onClick={() => reviveUser(user)}>
                    <i className="fa-solid fa-briefcase-medical"></i>
                </button>}
            </div>
            {user && user._id ? <>
                <Paper elevation={3} className="userPaperContainer">
                    <div id="showUserContent">
                        {user.profilePicture && !user.oAuth ? <img src={"https://localhost:3016/" + user.profilePicture} alt="Profile Picture" draggable={false}/> : user.oAuth ? <img src={user.profilePicture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                        <h2>{user.username}</h2>
                    </div>
                    
                    <div id="showUserDetails">
                        <h2>Detalles</h2>
                        <p>Nombre: {user.firstName}</p>
                        <p>Apellidos: {user.lastName}</p>
                        <p>Correo Electrónico: {user.email}</p>
                        <p>Estado: <b>{user.active ? "Activo" : "Cuenta Desactivada"}</b></p>
                    </div>
                </Paper>
                  <div id="showUserLibrary">
                    {ownedProjects.length > 0 && <>
                      <h5>Proyectos adquiridos</h5>
                      {ownedProjects.map(project => (
                        <p key={project._id}>
                          <Link to={`/projects/${project.name}`}>{project.name}</Link>
                        </p>
                      ))}
                    </>}
                  </div>
            </> : ""}

            {showConfirm && (
                <div className="modalContainer">
                  <div className="modalContent">
                    <p>¿Estás seguro de que quieres desactivar la cuenta del usuario <strong>{userToDelete.username}</strong>?</p>
                    <button onClick={deleteUser}>Sí, Eliminar</button>
                    <button onClick={() => handleConfirm(userToDelete)}>Cancelar</button>
                  </div>
                </div>
            )}
        </div>
    </>
  )
}

export default Show