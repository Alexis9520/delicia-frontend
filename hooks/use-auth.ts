import { useState, useEffect } from "react"
import { getUserData, isAuthenticated as checkAuth, logout as realLogout } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticatedState, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function syncAuth() {
      const userData = getUserData()
      const authenticated = checkAuth()
      setUser(userData)
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    syncAuth()

    // Mantener reactividad entre pestañas y eventos personalizados del sistema
    window.addEventListener("storage", syncAuth)
    window.addEventListener("authChanged", syncAuth as EventListener)

    return () => {
      window.removeEventListener("storage", syncAuth)
      window.removeEventListener("authChanged", syncAuth as EventListener)
    }
  }, [])

  // Nuevo: función logout que dispara el evento personalizado
  const logout = () => {
    realLogout() // limpia token/cookie
    // Dispara evento para que todos los hooks escuchen el cambio
    window.dispatchEvent(new Event("authChanged"))
  }

  return {
    user,
    isAuthenticated: isAuthenticatedState,
    isLoading,
    logout, // expón el método logout aquí
  }
}