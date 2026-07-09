import React, { useContext, useEffect, useState } from 'react'
import { useSendRequest } from '../../components/SendRequest'
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import "../../css/projects/Index.css"
import { cartContext } from '../../context/CartContext'
import { toastContext } from '../../context/ToastContext'
import SearchFilters from '../../components/SearchFiltersProjects'
import { userContext } from '../../context/UserContext'
import { Link } from 'react-router-dom'

function Index() {

  const [projects, setProjects] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [results, setResults] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState({})
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [ownedProjects, setOwnedProjects] = useState([])

  const {userData} = useContext(userContext)

  const [filters, setFilters] = useState({
    openSource: false,
    technologies: [],
    minPrice: 0,
    maxPrice: 450,
    sortBy: "recent"
  })

  const {cartProducts, setCartProducts} = useContext(cartContext)

  const { mostrarToast } = useContext(toastContext)

  const handleBusqueda = (e) => {
    const value = e.target.value
    setBusqueda(value)            
    setResults(projects.filter(pj => pj.name.toLowerCase().includes(value.toLowerCase())))
  }

  const sendRequest = useSendRequest()

  const getData = async () => {
    const response = await sendRequest("get", "", "/projects")
    if(response.status == 200){
      setProjects(response.data)
      setResults(response.data)
    }
  }

  const addToCart = async (project) => {
    const response = await sendRequest("get", "", "/cart/add/" + project._id)
    if(response.status == 200){
      setCartProducts(response.data)
    }
  }

  const handleConfirm = (project) => {
    if(!showConfirm){
      setShowConfirm(true)
      setProjectToDelete(project)
    } else{
      setShowConfirm(false)
      setProjectToDelete({})
    }
  }

  const deleteProject = async () => {
    if(projectToDelete){
      console.log(projectToDelete)
      const response = await sendRequest("delete", "", "/projects/" + projectToDelete._id, "", true)
      if(response.status == 200){
        mostrarToast("Proyecto Eliminado Correctamente", "success")
        handleConfirm(projectToDelete)
        getData()
      }
    }
  }

  const reviveProject = async (project) => {
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

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    console.log(filters)
    const filteredProjects = projects
      .filter(pj => {
        // Código abierto
        if (filters.openSource && !pj.openSource) return false
  
        // Tecnologías
        if (
          filters.technologies.length > 0 &&
          !filters.technologies.includes(pj.technology)
        ) return false
  
        // Precios
        const price = parseFloat(pj.price == "FREE" ? 0 : pj.price)
        if (price < filters.minPrice || price > filters.maxPrice) return false
  
        // Eliminados (Solo Administrador)
        if(userData && userData.data && userData.data.profile == "Administrador" && filters.deleted && !pj.deleted) return false

        return true
      })
      .sort((a, b) => {
        const priceA = parseFloat(a.price == "FREE" ? 0 : a.price)
        const priceB = parseFloat(b.price == "FREE" ? 0 : b.price)

        switch (filters.sortBy) {
          case "cheap":
            return priceA - priceB
          case "expensive":
            return priceB - priceA
          case "popular":
            return b.purchases - a.purchases
          case "recent":
          default:
            return new Date(b.created_at) - new Date(a.created_at)
        }
      })
  
    setResults(filteredProjects)
  }, [filters, projects])

  useEffect(() => {
    // Si no tenemos proyectos o userData, limpiamos y salimos
    if (!projects.length || !userData?.data?.library?.length) {
      setOwnedProjects([])
      return
    }

    // Creamos un Set con los idProject en la librería del usuario
    const ownedSet = new Set(
      userData.data.library.map(item => String(item.idProject))
    )

    // Recorremos _todos_ los proyectos y extraemos los que están en ownedSet
    const ownedIds = projects.filter(p => ownedSet.has(String(p._id))).map(p => p._id)

    setOwnedProjects(ownedIds)
  }, [userData?.data?.library, projects])
      
  return (
    <>
      <Nav/>
      <div id="allProjects" className="min-vh-100">
        <main className="d-flex">
          <SearchFilters filters={filters} setFilters={setFilters} isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen} />
          <div className="contentProjectsContainer flex-grow-1">
            <h2 className="mb-4">Explorar Proyectos</h2>
            {userData && userData.data && userData.data.profile == "Administrador" ? <div id="searchBoxContainer" className="adminSearchBox">
              <button id="newProjectBtn"><Link to="/projects/new"><i className="fa-solid fa-circle-plus"></i></Link></button>
              <input type="search" name="searchBox" id="searchBox" placeholder="Buscar..." onInput={handleBusqueda}/>
              <i className="fa-solid fa-magnifying-glass"></i>
              <button className="filters-toggle" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                <i className="fa-solid fa-filter"></i>
              </button>
            </div> : <div id="searchBoxContainer">
              <input type="search" name="searchBox" id="searchBox" placeholder="Buscar..." onInput={handleBusqueda}/>
              <i className="fa-solid fa-magnifying-glass"></i>
              <button className="filters-toggle" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                <i className="fa-solid fa-filter"></i>
              </button>
            </div>}
            
            <div id="projectsContainer" className="row g-4 mx-0">
              {results.length > 0 ? results.map((pr, index) => (
                pr.deleted && userData && userData.data && userData.data.profile == "Administrador" ? (
                  <div key={index} className="col-12 col-sm-6 col-md-4">
                    <div className="projectContainer deletedItem h-100">
                      <Link to={"/projects/" + pr.name}><img src={"https://localhost:3016/" + pr.projectIcon} alt={"Icon " + pr.name} draggable="false" /></Link>
                      <p>{pr.name}</p>
                      <div>
                        <p>{pr.price}</p>
                        <div className="controls">
                          <button id="reviveProjectBtn" onClick={() => reviveProject(pr)}><i className="fa-solid fa-briefcase-medical"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  userData && userData.data && userData.data.profile == "Administrador" || !pr.deleted ? (
                    <div key={index} className="col-12 col-sm-6 col-md-4">
                      <div className="projectContainer h-100">
                        <Link to={"/projects/" + pr.name}><img src={"https://localhost:3016/" + pr.projectIcon} alt={"Icon " + pr.name} draggable="false" /></Link>
                        <p>{pr.name}</p>
                        <div>
                          <p>{pr.price}</p>
                          {userData && userData.data && userData.data.profile == "Administrador" ? (
                            <div className="controls">
                              <button id="editProjectBtn">
                                <Link to={"/projects/edit/" + pr.name}>
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </Link>
                              </button>
                              <button id="deleteProjectBtn" onClick={() => handleConfirm(pr)}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="controls">
                              {!ownedProjects.includes(pr._id) ? <button id="addToCartBtn" onClick={() => addToCart(pr)}>
                                <i className="fa-solid fa-cart-shopping"></i>
                              </button> : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : ""
                )
              )) : (
                <h2>Sin Resultados</h2>
              )}
            </div>
          </div>

          {showConfirm && (
            <div className="modalContainer">
              <div className="modalContent">
                <p>¿Estás seguro de que quieres eliminar el proyecto <strong>{projectToDelete.name}</strong>?</p>
                <button onClick={deleteProject}>Sí, Eliminar</button>
                <button onClick={() => handleConfirm(projectToDelete)}>Cancelar</button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer/>
    </>
  )
}

export default Index