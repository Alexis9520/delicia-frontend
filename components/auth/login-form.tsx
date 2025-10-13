"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import {
  setAuthToken,
  setUserData,
  decodeUserFromToken,
  type AuthResponse,
} from "@/lib/auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response: AuthResponse = await api.post("/auth/login", {
        email,
        password,
      })
      setAuthToken(response.token)
      const user = decodeUserFromToken(response.token)
      setUserData(user || { email })

      // Dispara el evento para refrescar el estado de autenticación en toda la app
      window.dispatchEvent(new Event("authChanged"))

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      })
      // Redirección según rol
      switch (user?.role) {
        case "ROLE_ADMIN":
          router.push("/admin")
          break
        case "ROLE_TRABAJADOR":
          router.push("/trabajador")
          break
        case "ROLE_CLIENTE":
          router.push("/catalogo")
          break
        default:
          router.push("/")
      }
    } catch (error: any) {
      // Detecta mensaje personalizado del backend
      let description = "Credenciales inválidas"
      if (error?.message) {
        // Normaliza errores comunes
        if (
          error.message.toLowerCase().includes("contraseña incorrecta") ||
          error.message.toLowerCase().includes("password") ||
          error.message.toLowerCase().includes("credenciales inválidas")
        ) {
          description = "Contraseña incorrecta"
        } else if (
          error.message.toLowerCase().includes("usuario no encontrado") ||
          error.message.toLowerCase().includes("not found")
        ) {
          description = "Usuario no encontrado"
        } else {
          description = error.message
        }
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative"
    >
      {/* Borde degradado suave */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-300/60 via-rose-300/50 to-amber-400/60 opacity-70 blur-[2px] dark:from-amber-400/20 dark:via-rose-400/15 dark:to-amber-500/20" aria-hidden="true" />
      <Card className="relative w-full overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-center text-stone-600 dark:text-stone-300">
            Bienvenido de nuevo, nos alegra verte 🥐
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700 dark:text-stone-200">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 placeholder:text-stone-400 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700 dark:text-stone-200">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 placeholder:text-stone-400 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition-colors hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Acciones secundarias */}
            <div className="flex items-center justify-between gap-2 pt-1 text-sm">
              {/* Aquí puedes agregar links de recuperación de contraseña, etc */}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-rose-400 text-white shadow-lg shadow-rose-200/40 transition-all hover:from-amber-600 hover:to-rose-500 hover:shadow-rose-300/50 focus-visible:ring-amber-400 disabled:opacity-70 dark:shadow-none"
              disabled={isLoading}
            >
              <span className="relative flex w-full items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>Iniciar sesión</>
                )}
              </span>
              {/* Brillo sutil al hover */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 transition-transform duration-700 ease-out group-hover:translate-x-full" />
            </Button>

            <p className="text-center text-sm text-stone-600 dark:text-stone-300">
              ¿No tienes cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-amber-700 underline-offset-4 transition-colors hover:text-amber-800 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}