import { useContext, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { userContext } from "./context/UserContext"
import { ToastProvider } from "./context/ToastContext"
import { RequestLoadingProvider, requestLoadingContext } from "./context/RequestLoadingContext"
import { Cart } from "./context/CartContext"
import { ToastContainer } from "react-toastify"
import './App.css'
import Nav from "./components/layout/Nav"
import Footer from "./components/layout/Footer"
import RouteSkeleton from "./components/loaders/RouteSkeleton"

import Index from "./views/Index"
import Login from "./views/Login"
import Register from "./views/Register"
import Recovery from "./views/Recovery"
import UserData from "./views/UserData"
import Recover from "./views/Recover"
import Library from "./views/Library"
import SuccessPayment from "./components/payments/SuccessPayment"
import CancelPayment from "./components/payments/CancelPayment"

// PROJECTS
import IndexProjects from "./views/projects/Index"
import ShowProjects from "./views/projects/Show"
import NewProject from "./views/projects/New"
import EditProject from "./views/projects/Edit"

// USERS
import IndexUsers from "./views/users/Index"
import ShowUsers from "./views/users/Show"
import NewUser from "./views/users/New"

import RutasProtegidas from "./components/routing/RutasProtegidas"
import useSessionChecker from "./components/routing/SessionChecker"

function AnimatedRoutes() {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [minimumWaitKey, setMinimumWaitKey] = useState(location.key)
  const [initialLoadingComplete, setInitialLoadingComplete] = useState(false)
  const [initialMinimumWaitComplete, setInitialMinimumWaitComplete] = useState(false)
  const { pendingRequests } = useContext(requestLoadingContext)
  const isTransitioning = location.key !== displayLocation.key
  const showSkeleton = isTransitioning || !initialLoadingComplete

  useEffect(() => {
    const timeout = setTimeout(() => setInitialMinimumWaitComplete(true), 280)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!initialLoadingComplete && initialMinimumWaitComplete && pendingRequests === 0) {
      setInitialLoadingComplete(true)
    }
  }, [initialLoadingComplete, initialMinimumWaitComplete, pendingRequests])

  useEffect(() => {
    if (!isTransitioning) return

    setMinimumWaitKey("")
    window.scrollTo({ top: 0, behavior: "smooth" })
    const timeout = setTimeout(() => setMinimumWaitKey(location.key), 280)

    return () => clearTimeout(timeout)
  }, [location.key, isTransitioning])

  useEffect(() => {
    if (isTransitioning && minimumWaitKey === location.key && pendingRequests === 0) {
      setDisplayLocation(location)
    }
  }, [location, isTransitioning, minimumWaitKey, pendingRequests])

  const routesWithoutChrome = ["/login", "/register", "/recovery", "/reset-password", "/payment/success", "/payment/cancel"]
  const chromeLocation = isTransitioning ? displayLocation.pathname : location.pathname
  const showChrome = !routesWithoutChrome.includes(chromeLocation)
  const backgroundVariant = location.pathname === "/profile"
    ? "profile"
    : location.pathname === "/library"
      ? "catalog"
    : location.pathname === "/" || location.pathname.startsWith("/projects/") && !["/projects/new"].includes(location.pathname) && !location.pathname.startsWith("/projects/edit/") || location.pathname.startsWith("/users/") && location.pathname !== "/users/new"
      ? "wide"
      : routesWithoutChrome.includes(location.pathname)
        ? "auth"
        : "catalog"

  return (
    <>
      {showChrome && <Nav/>}
      <main className={`route-content ${showSkeleton ? `route-background-${backgroundVariant}` : ""}`} aria-busy={showSkeleton}>
        <div className={showSkeleton ? "route-view-hidden" : "route-view"} aria-hidden={showSkeleton}>
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
              <Route path="/library" element={<Library/>}/>
              <Route path="/payment/success" element={<SuccessPayment/>}/>
              <Route path="/payment/cancel" element={<CancelPayment/>}/>
              <Route path="/users" element={<IndexUsers/>}/>
              <Route path="/users/new" element={<NewUser/>}/>
              <Route path="/users/:username" element={<ShowUsers/>}/>
            </Route>
          </Routes>
        </div>
        {showSkeleton && <RouteSkeleton pathname={location.pathname}/>}
      </main>
      {showChrome && <Footer/>}
    </>
  )
}

function App() {
  // Para Comprobar que la sesión NO ha caducado
  const { userData } = useContext(userContext)
  useSessionChecker(userData)

  return (
    <BrowserRouter>
      <RequestLoadingProvider>
      <Cart>
      <ToastProvider>
        <AnimatedRoutes />
        <ToastContainer/>
      </ToastProvider>
      </Cart>
      </RequestLoadingProvider>
    </BrowserRouter>
  )
}

export default App
