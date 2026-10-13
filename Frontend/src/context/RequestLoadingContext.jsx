import { createContext, useState } from "react"

export const requestLoadingContext = createContext({
  pendingRequests: 0,
  startRequest: () => {},
  finishRequest: () => {},
})

export function RequestLoadingProvider({ children }) {
  const [pendingRequests, setPendingRequests] = useState(0)

  const startRequest = () => setPendingRequests(count => count + 1)
  const finishRequest = () => setPendingRequests(count => Math.max(0, count - 1))

  return (
    <requestLoadingContext.Provider value={{ pendingRequests, startRequest, finishRequest }}>
      {children}
    </requestLoadingContext.Provider>
  )
}