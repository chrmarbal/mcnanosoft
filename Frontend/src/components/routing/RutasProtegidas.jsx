import React, { useContext } from 'react'
import { userContext } from "../../context/UserContext"
import { Navigate, Outlet } from 'react-router-dom'

export const RutasProtegidas = () => {
  const {userData, loading} = useContext(userContext)

  if (loading) {
    return null
  }

  if(!userData){
    return <Navigate to="/login"/>
  } else{
    return <Outlet/>
  }
}

export default RutasProtegidas