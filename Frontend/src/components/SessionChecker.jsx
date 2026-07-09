import { useEffect } from "react"
import axios from "axios"

function useSessionChecker (userData) {
    useEffect(() => {
        if(userData){
            const interval = setInterval(async () => {
                try {
                    const response = await axios("/users/session", {method: "get"})
                    if(response.status == 204 && userData){
                        window.location.href = "/login"
                    }
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        window.location.href = "/login"
                    }
                }
            }, 172800001)
            return () => clearInterval(interval)
        }
    }, [userData])
}

export default useSessionChecker