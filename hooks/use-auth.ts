"use client"

import { useState, useEffect } from "react"
import { type User, getUserData, isAuthenticated as checkAuth } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = getUserData()
    const authenticated = checkAuth()

    setUser(userData)
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}
