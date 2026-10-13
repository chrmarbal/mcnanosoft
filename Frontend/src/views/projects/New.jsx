import React, { useContext, useEffect, useState } from 'react'
import { TextField, Autocomplete, Box, Avatar, Typography, InputAdornment } from '@mui/material'
import axios from 'axios'
import "../../css/projects/New.css"
import { toastContext } from '../../context/ToastContext'
import { Link, useNavigate } from 'react-router-dom'
import StarBorder from '../../components/shared/StarBorder'
import { userContext } from '../../context/UserContext'

function New() {

    const go = useNavigate()
    const { mostrarToast } = useContext(toastContext)
    const { userData, setUserData } = useContext(userContext)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [icon, setIcon] = useState("")
    const [technology, setTechnology] = useState(null)
    const [thumbnail, setThumbnail] = useState("")
    const [source, setSource] = useState("")
    const [size, setSize] = useState("")

    const [iconName, setIconName] = useState("Selecciona un Archivo")
    const [thumbnailName, setThumbnailName] = useState("Selecciona un Archivo")
    const [sourceName, setSourceName] = useState("Selecciona un Archivo")

    const technologies = [
        { label: "Java", image: "/imgs/technologies/Java.png" },
        { label: "JavaScript", image: "/imgs/technologies/JavaScript.png" },
        { label: "Python", image: "/imgs/technologies/Python.png" },
        { label: "PHP", image: "/imgs/technologies/PHP.png" },
        { label: "C", image: "/imgs/technologies/C.png" },
        { label: "C++", image: "/imgs/technologies/C++.png" },
        { label: "C#", image: "/imgs/technologies/CS.png" }
    ]

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

    const handleTechnology = (technology) => {
        setTechnology(technology)
    }

    const handleSource = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setSource(file)
        setSourceName(file.name)

        const bytes = file.size
        const kb = 1024
        const mb = kb * 1024
        let sizeStr

        if (bytes < kb) {
            sizeStr = `${bytes} Bytes`
        } else if (bytes < mb) {
            sizeStr = `${(bytes / kb).toFixed(2)} KB`
        } else {
            sizeStr = `${(bytes / mb).toFixed(2)} MB`
        }

        setSize(sizeStr)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const project = {
            name: name,
            description: description,
            price: price,
            size: size,
            technology: technology.label,
            openSource: price === 0
        }

        const formData = new FormData()
        formData.append("icon", icon)
        formData.append("thumbnail", thumbnail)
        formData.append("source", source)
        formData.append("project", JSON.stringify(project))
    
        const response = await axios.post("/projects", formData, {headers: {"Content-Type": "multipart/form-data"}})
        if(response.status == 200){
            mostrarToast("Proyecto Creado Correctamente", "success")
            setUserData(ud => ud.data = response.data.adminData)
            window.location.href = "/projects"
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
        <div id="newProjectContainer">
            <h1>Nuevo Proyecto</h1>

            <div className="controls">
                <Link to="/projects"><i className="fa-solid fa-reply"></i> Volver</Link>
            </div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="projectName">Nombre</label>
                <br />
                <TextField className="newProjectText" size="small" onChange={handleName} variant="outlined"></TextField>

                <br /><br />

                <label htmlFor="projectDescription">Descripción</label>
                <br />
                <TextField className="newProjectText" size="small" onChange={handleDescription} variant="outlined"></TextField>

                <br /><br />

                <label htmlFor="projectPrice">Precio (0 para gratis)</label>
                <br />
                <TextField className="newProjectText" type="number" inputProps={{ step: "0.01", min: "0" }} size="small" value={price} onChange={handlePrice} variant="outlined"></TextField>

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

                <label htmlFor="technology">Tecnología</label>
                <br />
                <Autocomplete className="newProjectText" size="small" sx={{width: "300px", backgroundColor: "#191860", color: "#cfcfcf"}} options={technologies} getOptionLabel={(option) => option?.label || ""} value={technology} onChange={(event, newValue) => handleTechnology(newValue)} isOptionEqualToValue={(option, value) => option?.label === value?.label || option?.label === value} componentsProps={{
                    paper: {
                        sx: {
                            backgroundColor: '#191860',
                            color: '#fff',
                            margin: 0,
                        }
                    },
                    listbox: {
                        sx: {
                            padding: 0,
                        }
                    }
                }} renderInput={(params) => (
                    <TextField {...params} variant="outlined"
                    // Añadimos un startAdornment para mostrar la imagen, si hay un valor seleccionado
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: technology && technology.image ? (
                            <InputAdornment position="start">
                                <Avatar src={technology.image} alt={technology.label} sx={{ width: 24, height: 24, marginRight: 1 }}/>
                            </InputAdornment>
                        ) : null,
                        // Mantenemos el endAdornment que ya tenía
                        endAdornment: params.InputProps.endAdornment,
                    }}/>
                )} renderOption={(props, option) => {
                    const { key, ...rest } = props
                    return (
                        <Box key={key} component="li" {...rest} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: "#cfcfcf", backgroundColor: "#191860" }}>
                            <Avatar src={option.image} alt={option.label} sx={{ width: 24, height: 24 }} />
                            <Typography>{option.label}</Typography>
                        </Box>
                    )
                }}/>
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
            </form>
        </div>
    </>
  )
}

export default New