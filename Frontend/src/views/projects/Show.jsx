import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { userContext } from '../../context/UserContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSendRequest } from '../../components/api/SendRequest'
import "../../css/projects/Show.css"
import { toastContext } from '../../context/ToastContext'
import { Rating } from '@mui/material'
import { cartContext } from '../../context/CartContext'

function Show() {

  const [project, setProject] = useState({})
  const [ratings, setRatings] = useState([])
  const [users, setUsers] = useState([])
  const [projectToDelete, setProjectToDelete] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAlertLogin, setShowAlertLogin] = useState(false)
  const [showAlertOwnProject, setShowAlertOwnProject] = useState(false)
  const [newRating, setNewRating] = useState({})
  const [ownedProject, setOwnedProject] = useState(false)

  const [addRating, setAddRating] = useState(true)

  const { mostrarToast } = useContext(toastContext)
  const { userData } = useContext(userContext)
  const { setCartProducts, setIsCartLoading } = useContext(cartContext)


  const projectName = useParams().name
  const sendRequest = useSendRequest()
  const go = useNavigate()

  const getData = async () => {
    const response = await sendRequest("get", "", "/projects")
    if(response.status == 200){
      for (let pr of response.data) {
        if(pr.name == projectName){
          setProject(pr)
          if((pr.deleted && userData && userData.data.profile != "Administrador") || (pr.deleted && !userData)){
            go("/projects")
          }
          if(userData && userData.data){
            setNewRating(nr => ({
              ...nr,
              idUser: userData.data._id,
              idProject: pr._id
            }))
          }
          const resp = await sendRequest("get", "", "/ratings/project/" + pr._id, "", false, false)
          if(resp.status == 200){
            setRatings(resp.data.ratingData)
            setUsers(resp.data.usersData)
          }
          break
        }
      }
    }
  }

  const handleConfirm = () => {
    if(!showConfirm){
      setShowConfirm(true)
      setProjectToDelete(project)
    } else{
      setShowConfirm(false)
      setProjectToDelete({})
    }
  }

  const handleAlertLogin = () => {
    if(!showAlertLogin){
      setShowAlertLogin(true)
    } else{
      setShowAlertLogin(false)
    }
  }

  const handleAlertOwnProject = () => setShowAlertOwnProject(open => !open)

  const handleRating = async (e) => {
    setNewRating(nr => ({
      ...nr,
      rating: e.target.value
    }))
  }

  const handleOpinion = async (e) => {
    setNewRating(nr => ({
      ...nr,
      opinion: e.target.value
    }))
  }

  const addToCart = async () => {
    if(!userData){
      go("/login")
      return
    }
    setIsCartLoading(true)
    try {
      const response = await sendRequest("get", "", "/cart/add/" + project._id)
      if(response?.status === 200){
        setCartProducts(response.data)
        mostrarToast("Proyecto añadido al carrito", "success")
      }
    } finally {
      setIsCartLoading(false)
    }
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if(!userData){
      setShowAlertLogin(true)
    } else{
      if(ownedProject){
        const response = await sendRequest("post", newRating, "/ratings", "", true)
        if(response.status == 200){
          mostrarToast("Opinión Puesta Correctamente. El Administrador tendrá que aprobarla para que sea pública")
          setRatings(rt => [...rt, response.data])
          setNewRating({})
        }
      } else{
        setShowAlertOwnProject(true)
      }
    }
  }

  const deleteProject = async () => {
    if(projectToDelete){
      const response = await sendRequest("delete", "", "/projects/" + projectToDelete._id, "", true)
      if(response.status == 200){
        mostrarToast("Proyecto Eliminado Correctamente", "success")
        handleConfirm(projectToDelete)
        getData()
      }
    }
  }

  const reviveProject = async () => {
    const projectData = project
    projectData.deleted = false

    const formData = new FormData()
    formData.append("project", JSON.stringify(projectData))

    const response = await axios.patch("/projects/edit/" + project._id, formData, {headers: {"Content-Type": "multipart/form-data"}})
    if(response.status == 200){
      mostrarToast("Proyecto Restaurado Correctamente", "success")
      getData()
    }
  }

  const handleApprove = async (id) => {
    const response = await sendRequest("patch", { aproved: true }, "/ratings/" + id, "", true)
    if(response.status == 200){
      mostrarToast("Opinión Aprobada Correctamente", "success")
      getData()
    }
  }

  const handleReject = async (id) => {
    const response = await sendRequest("patch", { aproved: false }, "/ratings/" + id, "", true)
    if(response.status == 200){
      mostrarToast("Opinión Rechazada Correctamente", "success")
      getData()
    }
  }

  useEffect(() => {
    const library = userData?.data?.library || []
    setOwnedProject(library.some(item => String(item.idProject || item) === String(project._id)))
    if(userData && userData.data){
      for (let rating of ratings) {
        if(rating.idUser == userData.data._id){
          setAddRating(false)
          break
        }
      }
    }
  }, [ratings, userData, project._id])

  useEffect(() => {
    getData()
  }, [])

  return (
    <>
      <div id="showProjectContainer">
        <div className="controls">
          <Link to="/projects"><i className="fa-solid fa-reply"></i> Volver</Link>
          {userData && userData.data && userData.data.profile == "Administrador" ? <>
            {!project.deleted ? <button id="deleteProjectBtn" onClick={() => handleConfirm(project)}>
              <i className="fa-solid fa-trash"></i>
            </button> : <button id="reviveProjectBtn" onClick={() => reviveProject(project)}>
              <i className="fa-solid fa-briefcase-medical"></i>
            </button>}
          </> : ""}
        </div>
        {project && project._id ? 
          <>
            <div id="projectDetailWrapper">
              <div className="projectSection">
                <div className="projectInfoCard">
                  <img src={"https://localhost:3016/" + project.projectIcon} alt="Project Icon" draggable={false} />
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>

                  <div className="techSection">
                    <p>Tecnología</p>
                    <div className="techBadge">
                      <img src={`/imgs/technologies/${project.technology !== "C#" ? project.technology : "CS"}.png`} alt="Tech" draggable={false}/>
                      <span>{project.technology}</span>
                    </div>
                  </div>

                  <div className="projectDetails">
                    <p><strong>Precio:</strong> {project.price}</p>
                    <p><strong>Tamaño:</strong> {project.size}</p>
                    <p><strong>Ventas:</strong> {project.purchases || 0}</p>
                  </div>

                  <div className="projectButtons">
                    {ownedProject && project.openSource && project.gitHubRepoUrl && (
                      <a href={project.gitHubRepoUrl} target="_blank" rel="noopener noreferrer" className="githubButton">
                        <img src="/imgs/Logo GitHub.png" alt="GitHub Icon" draggable={false} />
                      </a>
                    )}
                    {ownedProject ? (
                      <div className="ownedProjectWrapper">
                        <div className="ownedProject">
                          <i className="fa-solid fa-circle-check"></i>
                          <label>Ya tienes este proyecto en tu biblioteca</label>
                        </div>
                        <Link className="actionButton" to="/library">Ver en Biblioteca</Link>
                      </div>
                    ) : !project.deleted ? (
                      <div className="ownedProjectWrapper">
                        <button className="addToCartButton" onClick={addToCart}>Añadir al carrito</button>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                </div>
              </div>

              <div id="projectHeroSection">
                <img src={`https://localhost:3016/${project.thumbnail}`} alt="Project Cover" draggable={false}/>
              </div>
            </div>

            {userData && userData.data && addRating && userData.data.profile != "Administrador" && ownedProject ? <div className="addRatingSection">
              <h3>¿Qué te ha parecido este proyecto?</h3>
              <form onSubmit={handleSubmitRating}>
                <Rating defaultValue={0} precision={0.25} onChange={handleRating}/>
                <textarea required placeholder="Deja tu opinión aquí..." onChange={handleOpinion}/>
                <button>Enviar valoración</button>
              </form>
            </div> : ""}

            <div className="ratingsSection">
              <h2>Opiniones & Valoraciones</h2>
              {ratings && ratings.length > 0 ? (
                <>
                  {/* Mostrar primero las pendientes */}
                  {userData && userData.data.profile == "Administrador" ? ratings
                    .filter(rt => rt.aproved === "Pendiente")
                    .map((rt, idx) => {
                      const user = users.find(u => u._id === rt.idUser);
                      return (
                        <div className="ratingCard pending" key={`pending-${idx}`}>
                          <Rating precision={0.25} value={rt.rating} readOnly />
                          {user && (
                            <div className="ratingUser">
                              {user.profilePicture && !user.oAuth ? <img src={"https://localhost:3016/" + user.profilePicture} alt="Profile Picture" draggable={false}/> : user.oAuth ? <img src={user.profilePicture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                              <p>{user.username}</p>
                            </div>
                          )}
                          <p>{rt.opinion}</p>

                          {/* Botones solo si es admin */}
                          {userData && userData.data.profile === "Administrador" && (
                            <div className="adminControls">
                              <button onClick={() => handleApprove(rt._id)}>Aceptar</button>
                              <button onClick={() => handleReject(rt._id)}>Rechazar</button>
                            </div>
                          )}
                        </div>
                      );
                    }) : ""}

                  {/* Mostrar las aprobadas o el mensaje si no hay ninguna */}
                  {ratings.some(rt => rt.aproved === "Aprobado") ? (
                    ratings
                      .filter(rt => rt.aproved === "Aprobado")
                      .map((rt, idx) => {
                        const user = users.find(u => u._id === rt.idUser);
                        return (
                          <div className="ratingCard" key={`approved-${idx}`}>
                            <Rating precision={0.25} value={rt.rating} readOnly />
                            {user && (
                              <div className="ratingUser">
                                {user.profilePicture && !user.oAuth ? <img src={"https://localhost:3016/" + user.profilePicture} alt="Profile Picture" draggable={false}/> : user.oAuth ? <img src={user.profilePicture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                                <p>{user.username}</p>
                              </div>
                            )}
                            <p>{rt.opinion}</p>
                          </div>
                        );
                      })
                  ) : (
                    <p>No hay valoraciones aún.</p>
                  )}
                </>
              ) : (
                <p>No hay valoraciones aún.</p>
              )}
            </div>
          </> : ""}

          {showConfirm && (
            <div className="modalContainer">
              <div className="modalContent">
                <p>¿Estás seguro de que quieres eliminar el proyecto <strong>{projectToDelete.name}</strong>?</p>
                <button onClick={deleteProject}>Sí, Eliminar</button>
                <button onClick={handleConfirm}>Cancelar</button>
              </div>
            </div>
          )}

          {showAlertLogin && (
            <div className="modalContainer">
              <div className="modalContent-Login">
                <p>Para poder poner una valoración debes iniciar sesión. ¿Quieres iniciar sesión?</p>
                <Link to="/login">
                  <button>Iniciar Sesión</button>
                </Link>
                <button onClick={handleAlertLogin}>Cancelar</button>
              </div>
            </div>
          )}

          {showAlertOwnProject && (
            <div className="modalContainer">
              <div className="modalContent">
                <p>Para valorar este proyecto primero debes adquirirlo.</p>
                <button onClick={() => { addToCart(); setShowAlertOwnProject(false) }}>Añadir al carrito</button>
                <button onClick={handleAlertOwnProject}>Cancelar</button>
              </div>
            </div>
          )}

      </div>
    </>
  )
}

export default Show