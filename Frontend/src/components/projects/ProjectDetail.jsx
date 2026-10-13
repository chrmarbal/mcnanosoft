import React, { useContext } from 'react'
import "../../css/Library.css"
import { toastContext } from '../../context/ToastContext'
import axios from 'axios'

const ProjectDetail = ({ project }) => {
  const {mostrarToast} = useContext(toastContext)
  if (!project) return <p>Selecciona un proyecto para ver los detalles</p>

  const handleDownload = async () => {
    const response = await axios.get("/projects/download/" + project.projectUrl, {responseType: "blob"})
    if(response.status == 200){
      try {
        // Extrae el nombre del archivo desde el header "content-disposition"
        let fileName = project.name +  ".zip" // Valor por defecto
        const disposition = response.headers["content-disposition"]
        if (disposition && disposition.indexOf("filename=") !== -1) {
          const filenameRegex = /filename[^=\n]*=((['"]).*?\2|[^\n]*)/
          const matches = filenameRegex.exec(disposition)
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, "")
          }
        }

        // Crea una URL temporal para el blob recibido
        const url = window.URL.createObjectURL(response.data)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName // Asigna el nombre recibido o el por defecto
        document.body.appendChild(a)
        a.click()

        // Limpieza: elimina el enlace y revoca la URL temporal
        a.remove()
        window.URL.revokeObjectURL(url)

        mostrarToast(response.data, "success")
      } catch (error) {
        console.error(error)
      }
    }
  }


  return (
    <div className="project-card">
      <div className="project-header">
        <img className="project-logo" src={`https://localhost:3016/${project.projectIcon}`} alt={`${project.name} Logo`} draggable={false}/>
        <h2>{project.name}</h2>
        {project.price == "FREE" && project.gitHubRepoUrl && (
          <a href={project.gitHubRepoUrl} target="_blank" rel="noopener noreferrer" className="githubButton">
            <img src="/imgs/Logo GitHub.png" alt="GitHub Icon" draggable={false}/>
          </a>
        )}
      </div>
      <p className="project-description">{project.description}</p>

      <div className="project-media">
        <img className="project-cover" src={`https://localhost:3016/${project.thumbnail}`} alt={`${project.name} Cover`} draggable={false}/>
      </div>

      <button className="download-button" onClick={handleDownload}>
        DESCARGAR
        <i className="fa-solid fa-download"></i>
      </button>
    </div>
  )
}

export default ProjectDetail