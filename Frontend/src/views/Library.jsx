import React, { useContext, useEffect, useState } from 'react'
import "../css/Library.css"
import { userContext } from '../context/UserContext'
import { Link, useNavigate } from 'react-router-dom'
import { useSendRequest } from '../components/api/SendRequest'
import ProjectDetail from '../components/projects/ProjectDetail'

function Library() {
  const { userData } = useContext(userContext)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)

  const sendRequest = useSendRequest()
  const go = useNavigate()

  const getData = async () => {
    // Trae todos los proyectos de la ruta /projects/library
    const response = await sendRequest("get", "", "/projects/library")
    if (response.status !== 200) return

    const allProjects = response.data
    // Filtra los que el usuario realmente posee
    const owned = []
    for (let op of userData.data.library || []) {
      for (let pr of allProjects) {
        if (String(op.idProject) === String(pr._id)) {
          owned.push(pr)
          break
        }
      }
    }
    setProjects(owned)
  }

  useEffect(() => {
    if (!userData) {
      go("/")
    } else {
      getData()
    }
  }, [userData])

  // Prevenir scroll cuando el menú está abierto en móvil
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset'
  }, [isSidebarOpen])

  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setIsSidebarOpen(false)
  }

  return (
    <>
      <div id="libraryContainer">
        {/* Overlay para cerrar el menú al hacer clic fuera */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className={`library-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <h1>BIBLIOTECA</h1>
          {projects.length > 0 ? (
            <ul>
              {projects.map((pr) => (
                <li
                  key={pr._id}
                  onClick={() => handleProjectClick(pr)}
                  className={pr.deleted ? 'deleted' : ''}
                >
                  <img
                    src={`https://localhost:3016/${pr.projectIcon}`}
                    alt="Project Icon"
                    draggable={false}
                  />
                  <span className="project-name">{pr.name}</span>
                  {pr.deleted && (
                    <span className="unavailable-label">No disponible</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tienes proyectos adquiridos</p>
          )}
        </aside>

        <main className="library-main">
          <div className="library-header">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <i className="fa-solid fa-book-open"></i>
            </button>
            <h2>Biblioteca de Proyectos</h2>
          </div>

          {/* Área principal: detalle o placeholder si está borrado */}
          {selectedProject ? (
            selectedProject.deleted ? (
              <div className="project-not-available">
                <h3>Proyecto no disponible</h3>
                <p>Lo sentimos, este proyecto no se encuentra disponible en estos momentos.</p>
              </div>
            ) : (
              <ProjectDetail project={selectedProject} />
            )
          ) : (
            <div className="select-placeholder">
              <p>Selecciona un proyecto de la lateral para ver sus detalles.</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default Library