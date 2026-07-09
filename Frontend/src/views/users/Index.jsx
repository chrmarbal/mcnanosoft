import React, { useContext, useEffect, useState } from 'react'
import { useSendRequest } from '../../components/SendRequest'
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import "../../css/users/Index.css"
import { toastContext } from '../../context/ToastContext'
import SearchFiltersUsers from '../../components/SearchFiltersUsers'
import { userContext } from '../../context/UserContext'
import { Link } from 'react-router-dom'

function Index() {

  const [users, setUsers] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [results, setResults] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState({})
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const {userData} = useContext(userContext)

  const [filters, setFilters] = useState({
    sortBy: "recent",
    active: true
  })

  const { mostrarToast } = useContext(toastContext)

  const handleBusqueda = (e) => {
    const value = e.target.value
    setBusqueda(value)            
    setResults(users.filter(us => us.username.toLowerCase().includes(value.toLowerCase())))
  }

  const sendRequest = useSendRequest()

  const getData = async () => {
    const response = await sendRequest("get", "", "/users", "", true)
    if(response.status == 200){
      console.log(response.data)
      setUsers(response.data)
      setResults(response.data)
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
    getData()
  }, [])

  useEffect(() => {
    console.log(results)
  }, [results])

  useEffect(() => {
    const filteredUsers = users
      .filter(user => {
        if (!filters.active && user.active) return false
        return true
      })
      .sort((a, b) => {
        console.log(a)
        switch (filters.sortBy) {
          case "name-asc":
            return a.username.localeCompare(b.username)
          case "name-desc":
            return b.username.localeCompare(a.username)
          case "recent":
          default:
            return new Date(b.created_at) - new Date(a.created_at)
        }
      })
  
    setResults(filteredUsers)
  }, [filters, users])
  
      
  return (
    <>
      <Nav/>
      <div id="allUsers" className="min-vh-100">
        <main className="d-flex">
          <SearchFiltersUsers filters={filters} setFilters={setFilters} isOpen={isFiltersOpen} setIsOpen={setIsFiltersOpen}/>
          <div className="contentUsersContainer flex-grow-1">
            <h2 className="mb-4">Listado de Usuarios</h2>

            <div id="searchBoxContainer">
              <button id="newProjectBtn"><Link to="/users/new"><i className="fa-solid fa-circle-plus"></i></Link></button>
              <input type="search" name="searchBox" id="searchBox" placeholder="Buscar..." onInput={handleBusqueda}/>
              <i className="fa-solid fa-magnifying-glass"></i>
              <button className="filters-toggle" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                <i className="fa-solid fa-filter"></i>
              </button>
            </div>
            
            <div id="usersContainer" className="row g-4 mx-0">
              {results.length > 0 ? results.map((user, index) => (
                !user.active ? (  
                  <div key={index} className="col-12 col-sm-6 col-md-4">
                    <div className="userContainer deletedItem h-100">
                      <Link to={"/users/" + user.username}>
                        {user.profilePicture && !user.oAuth ? <img src={"https://localhost:3016/" + user.profilePicture} alt="Profile Picture" draggable={false}/> : user.oAuth ? <img src={user.profilePicture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                      </Link>
                      <p>{user.username}</p>
                      <div>
                        <div className="controls">
                          <button id="reviveProjectBtn" onClick={() => reviveUser(user)}><i className="fa-solid fa-briefcase-medical"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="col-12 col-sm-6 col-md-4">
                    <div className="userContainer h-100">
                      <Link to={"/users/" + user.username}>
                        {user.profilePicture && !user.oAuth ? <img src={"https://localhost:3016/" + user.profilePicture} alt="Profile Picture" draggable={false}/> : user.oAuth ? <img src={user.profilePicture} alt="Profile Picture" draggable={false}/> : <img src="https://localhost:3016/imgs/default/user.jpg" alt="Profile Picture" draggable={false}/>}
                      </Link>
                      <p>{user.username}</p>
                      <div>
                        <div className="controls">
                          <button id="deleteProjectBtn" onClick={() => handleConfirm(user)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )) : (
                <h2>Sin Resultados</h2>
              )}
            </div>

          </div>
        </main>

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
      <Footer/>
    </>
  )
}

export default Index