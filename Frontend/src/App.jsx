import { useContext } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { userContext } from "./context/UserContext"
import { ToastProvider } from "./context/ToastContext"
import { ToastContainer } from "react-toastify"
import './App.css'

import Index from "./views/Index"
import Login from "./views/Login"
import Register from "./views/Register"
import Recovery from "./views/Recovery"
import UserData from "./views/UserData"
import Recover from "./views/Recover"
import Library from "./views/Library"

// PROJECTS
import IndexProjects from "./views/projects/Index"
import ShowProjects from "./views/projects/Show"
import NewProject from "./views/projects/New"
import EditProject from "./views/projects/Edit"

// USERS
import IndexUsers from "./views/users/Index"
import ShowUsers from "./views/users/Show"
import NewUser from "./views/users/New"

import RutasProtegidas from "./components/RutasProtegidas"
import useSessionChecker from "./components/SessionChecker"
import SuccessPayment from "./components/SuccessPayment"
import CancelPayment from "./components/CancelPayment"

function App() {
  // Para Comprobar que la sesión NO ha caducado
  const { userData } = useContext(userContext)
  useSessionChecker(userData)

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Index/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/projects" element={<IndexProjects/>}/>
          <Route path="/projects/:name" element={<ShowProjects/>}/>
          <Route path="/recovery" element={<Recovery/>}/>
          <Route path="/reset-password" element={<Recover/>}/>
          <Route element={<RutasProtegidas/>}>
            <Route path="/projects/new" element={<NewProject/>}/>
            <Route path="/projects/edit/:name" element={<EditProject/>}/>
            <Route path="/profile" element={<UserData/>}/>
            <Route path="/payment/success" element={<SuccessPayment/>}/>
            <Route path="/payment/cancel" element={<CancelPayment/>}/>
            <Route path="/users" element={<IndexUsers/>}/>
            <Route path="/users/new" element={<NewUser/>}/>
            <Route path="/users/:username" element={<ShowUsers/>}/>
            <Route path="/library" element={<Library/>}/>
          </Route>
        </Routes>
        <ToastContainer/>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
