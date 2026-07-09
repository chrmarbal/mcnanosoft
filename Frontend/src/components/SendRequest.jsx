import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toastContext } from "../context/ToastContext"
import axios from "axios"
import { userContext } from "../context/UserContext"

export const useSendRequest = () => {
    const go = useNavigate()

    const { mostrarToast } = useContext(toastContext)
    const {userData} = useContext(userContext)

    return async (method, params, url, redir = "", token = false) => {
        let res

        if(token){
            axios.defaults.headers.common['Authorization'] = 'Bearer '+ userData.token
        }

        if(params != ""){
            await axios({ method, url, data: params})
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
                }
            })
            
            return res
        } else{
            await axios({ method, url})
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
                }
            })
        }
        
        return res
    }
}