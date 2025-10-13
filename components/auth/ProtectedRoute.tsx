"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { UserData } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserData["role"][]
  redirectTo?: string
  customMessage?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
  customMessage,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [showDenied, setShowDenied] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }
      if (
        allowedRoles &&
        user &&
        user.role &&
        !allowedRoles.includes(user.role)
      ) {
        setShowDenied(true)
      } else {
        setShowDenied(false)
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (showDenied) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
        <div className="max-w-md bg-white shadow-lg rounded p-8">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="mb-4">
            {customMessage ||
              "No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un error."}
          </p>
          <button
            className="bg-primary text-white px-4 py-2 rounded font-bold"
            onClick={() => router.push("/")}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}