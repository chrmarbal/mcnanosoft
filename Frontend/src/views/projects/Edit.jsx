import React, { useContext, useEffect, useState } from 'react'
import { TextField, Autocomplete, Box, Avatar, Typography } from '@mui/material'
import axios from 'axios'
import "../../css/projects/New.css"
import { toastContext } from '../../context/ToastContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StarBorder from '../../components/shared/StarBorder'
import { userContext } from '../../context/UserContext'
import { useSendRequest } from '../../components/api/SendRequest'

function Edit() {

  const go = useNavigate()
  const { mostrarToast } = useContext(toastContext)
  const { userData } = useContext(userContext)
  const sendRequest = useSendRequest()

  const projectName = useParams().name

  const [projectData, setProjectData] = useState({})

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [icon, setIcon] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [source, setSource] = useState("")
  const [size, setSize] = useState("")

  const [iconName, setIconName] = useState("Selecciona un Archivo")
  const [thumbnailName, setThumbnailName] = useState("Selecciona un Archivo")
  const [sourceName, setSourceName] = useState("Selecciona un Archivo")

  const handleName = (e) => {
    setName(e.target.value)
  }

  const handleDescription = (e) => {
    setDescription(e.target.value)
  }

  const handlePrice = (e) => {
    setPrice(Math.max(0, Number(e.target.value)))
  }

  const handleIcon = (e) => {
    setIcon(e.target.files[0])
    setIconName(e.target.files[0].name)
  }

  const handleThumbnail = (e) => {
    setThumbnail(e.target.files[0])
    setThumbnailName(e.target.files[0].name)
  }

  const handleSource = (e) => {
    setSource(e.target.files[0])
    setSourceName(e.target.files[0].name)
    setSize((e.target.files[0].size / 1048576).toFixed(2) + " MB")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const project = {
      name: name,
      description: description,
      price: price,
      openSource: price === 0
    }

    if(size != ""){
      project.size = size
    }

    const formData = new FormData()
    formData.append("project", JSON.stringify(project))

    if(icon != ""){
      formData.append("icon", icon)
    }

    if(thumbnail != ""){
      formData.append("thumbnail", thumbnail)
    }

    if(source != ""){
      formData.append("source", source)
    }

    const response = await axios.patch("/projects/edit/" + projectData._id, formData, {headers: {"Content-Type": "multipart/form-data"}})
    console.log(response)
    if(response.status == 200){
      mostrarToast("Proyecto Actualizado Correctamente", "success")
      go("/projects")
    }
  }

  const getData = async () => {
    const response = await sendRequest("get", "", "/projects")
    if(response.status == 200){
      let project = response.data.find(pr => pr.name == projectName)

      setName(project.name)
      setDescription(project.description)
      setPrice(project.price === "FREE" ? 0 : Number.parseFloat(project.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0)

      setIconName(project.projectIcon.replace("imgs/projects/", "")) 
      console.log(project.thumbnail)
      setThumbnailName(project.thumbnail.replace("imgs/projects/portadas/", ""))
    
      setProjectData(project)
    }
  }

  useEffect(() => {
    if(!userData){
      go("/login")
    } else if(userData && userData.data && userData.data.profile != "Administrador"){
      go("/")
    } else{
      getData()
    }
  }, [])

  return (
    <>
      <div id="newProjectContainer">
        <h1>Editar Proyecto</h1>

        <div className="controls">
          <Link to="/projects"><i className="fa-solid fa-reply"></i> Volver</Link>          
        </div>

        {projectData && projectData._id ? <form onSubmit={handleSubmit}>
          <label htmlFor="projectName">Nombre</label>
          <br />
          <TextField className="newProjectText" size="small" onChange={handleName} value={projectData.name} variant="outlined"></TextField>

          <br /><br />

          <label htmlFor="projectDescription">Descripción</label>
          <br />
          <TextField className="newProjectText" size="small" onChange={handleDescription} value={projectData.description} variant="outlined"></TextField>

          <br /><br />

          <label htmlFor="projectPrice">Precio (0 para gratis)</label>
          <br />
          <TextField className="newProjectText" type="number" inputProps={{ step: "0.01", min: "0" }} size="small" onChange={handlePrice} value={price} variant="outlined"></TextField>

          <br /><br />

          <label>Logo</label>
          <br />
          <label htmlFor="projectIcon" className="fileInputNewProject">
              <i className="fa-solid fa-upload"></i>
              {iconName}
          </label>
          <input type="file" name="projectIcon" id="projectIcon" onChange={handleIcon}/>

          <br />

          <label>Portada</label>
          <br />
          <label htmlFor="thumbnail" className="fileInputNewProject">
              <i className="fa-solid fa-upload"></i>
              {thumbnailName}
          </label>
          <input type="file" name="thumbnail" id="thumbnail" onChange={handleThumbnail}/>

          <br />

          <label>Código Fuente</label>
          <br />
          <label htmlFor="projectSource" className="fileInputNewProject">
              <i className="fa-solid fa-upload"></i>
              {sourceName}
          </label>
          <input type="file" name="projectSource" id="projectSource" onChange={handleSource}/>

          {source ? <>
            <p>Tamaño: {size}</p>
          </> : ""}

          <br />

          <StarBorder color="#cfcfcf">Enviar</StarBorder>
        </form> : "" }
      </div>
    </>
  )
}

export default Edit