"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }
      if (allowedRoles && user && !allowedRoles.includes(user.role ?? "")) {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (allowedRoles && user && !allowedRoles.includes(user.role ?? "")) return null

  return <>{children}</>
}