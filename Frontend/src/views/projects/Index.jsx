import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useSendRequest } from '../../components/api/SendRequest'
import "../../css/projects/Index.css"
import { toastContext } from '../../context/ToastContext'
import SearchFilters from '../../components/projects/SearchFiltersProjects'
import ResultsSkeleton from '../../components/loaders/ResultsSkeleton'
import { cartContext } from '../../context/CartContext'
import { userContext } from '../../context/UserContext'
import { Link } from 'react-router-dom'

function Index() {

  const [projects, setProjects] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [results, setResults] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [ownedProjects, setOwnedProjects] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState({})
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const {userData} = useContext(userContext)

  const [filters, setFilters] = useState({
    openSource: false,
    technologies: [],
    minPrice: 0,
    maxPrice: 450,
    sortBy: "recent"
  })

  const { mostrarToast } = useContext(toastContext)
  const { setCartProducts, setIsCartLoading } = useContext(cartContext)

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value)
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
    setIsFiltering(true)
    const timeout = setTimeout(() => {
      const search = busqueda.trim().toLowerCase()
      const filteredProjects = projects
        .filter(project => {
          if (!project.name.toLowerCase().includes(search)) return false
          if (filters.openSource && !project.openSource) return false
          if (filters.technologies.length > 0 && !filters.technologies.includes(project.technology)) return false
          const price = project.price === "FREE" ? 0 : Number.parseFloat(project.price.replace(/[^\d.,]/g, "").replace(",", "."))
          if (price < filters.minPrice || price > filters.maxPrice) return false
          if (userData && userData.data && userData.data.profile == "Administrador" && filters.deleted && !project.deleted) return false
          return true
        })
        .sort((a, b) => {
          const priceA = a.price === "FREE" ? 0 : Number.parseFloat(a.price.replace(/[^\d.,]/g, "").replace(",", "."))
          const priceB = b.price === "FREE" ? 0 : Number.parseFloat(b.price.replace(/[^\d.,]/g, "").replace(",", "."))
          switch(filters.sortBy){
            case "cheap": return priceA - priceB
            case "expensive": return priceB - priceA
            case "popular": return (b.purchases || 0) - (a.purchases || 0)
            default: return new Date(b.created_at) - new Date(a.created_at)
          }
        })

      setResults(filteredProjects)
      setIsFiltering(false)
    }, 220)

    return () => clearTimeout(timeout)
  }, [busqueda, filters, projects, userData])

  useEffect(() => {
    const library = userData?.data?.library || []
    setOwnedProjects(library.map(item => String(item.idProject || item)))
  }, [userData?.data?.library])
      
  return (
    <>
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
            
            <div id="projectsContainer" className="row g-4 mx-0" aria-busy={isFiltering} role={isFiltering ? "status" : undefined} aria-label={isFiltering ? "Actualizando proyectos" : undefined}>
              {isFiltering ? <ResultsSkeleton type="projects" /> : results.length > 0 ? results.map((pr, index) => (
                pr.deleted && userData && userData.data && userData.data.profile == "Administrador" ? (
                  <div key={index} className="col-12 col-sm-6 col-md-4">
                    <div className="projectContainer deletedItem h-100">
                      <Link to={"/projects/" + pr.name}><img src={"https://localhost:3016/" + pr.projectIcon} alt={"Icon " + pr.name} draggable="false" /></Link>
                      <p>{pr.name}</p>
                      <p>{pr.price}</p>
                      <div>
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
                        <p>{pr.price}</p>
                        <div>
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
                          ) : !ownedProjects.includes(String(pr._id)) ? (
                            <div className="controls">
                              <button id="addToCartBtn" onClick={() => addToCart(pr)} aria-label={`Añadir ${pr.name} al carrito`}>
                                <i className="fa-solid fa-cart-shopping"></i>
                              </button>
                            </div>
                          ) : (
                            <span className="owned-project-label">En tu biblioteca</span>
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
    </>
  )
}

export default Index