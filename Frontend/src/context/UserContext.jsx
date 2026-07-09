import axios from "axios";
import React, {createContext, useEffect, useState} from "react";

export const userContext = createContext()

export const UserProvider = ({children}) => {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        console.log(userData)
    }, [userData])

    const getData = async () => {
        try {
            setLoading(true)
            const response = await axios("/users/session", {method: "GET"})
            if(response.status == 200){
                setUserData(response.data)
            }
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    if(loading){
        return null
    }

    return(
        <userContext.Provider value={{userData, setUserData}}>
            {children}
        </userContext.Provider>
    )
}