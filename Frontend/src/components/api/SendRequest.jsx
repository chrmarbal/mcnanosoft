import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toastContext } from "../../context/ToastContext"
import { requestLoadingContext } from "../../context/RequestLoadingContext"
import axios from "axios"
import { userContext } from "../../context/UserContext"

export const useSendRequest = () => {
    const go = useNavigate()

    const { mostrarToast } = useContext(toastContext)
    const {userData} = useContext(userContext)
    const { startRequest, finishRequest } = useContext(requestLoadingContext)

    return async (method, params, url, redir = "", token = false, blocksNavigation = true) => {
        let res

        if(blocksNavigation){
            startRequest()
        }
        try {
            if(token){
                axios.defaults.headers.common['Authorization'] = 'Bearer '+ userData.token
            }

            if(params != ""){
                await axios({ method, url, data: params, timeout: blocksNavigation ? 15000 : 0})
                .then((response) => {
                    res = response
                    if(redir){
                        go(redir)
                    }

                    return res
                })
                .catch((error) => {
                    if(error.response){
                        mostrarToast(error.response.data, "error")
                        res = error.response
                    } else {
                        mostrarToast("No se pudo conectar con el servidor. Inténtalo de nuevo.", "error")
                    }
                })

                return res
            } else{
                await axios({ method, url, timeout: blocksNavigation ? 15000 : 0})
                .then((response) => {
                    res = response
                    if(redir){
                        go(redir)
                    }

                    return res
                })
                .catch((error) => {
                    if(error.response){
                        mostrarToast(error.response.data, "error")
                        res = error.response
                    } else {
                        mostrarToast("No se pudo conectar con el servidor. Inténtalo de nuevo.", "error")
                    }
                })
            }

            return res
        } finally {
            if(blocksNavigation){
                finishRequest()
            }
        }
    }
}