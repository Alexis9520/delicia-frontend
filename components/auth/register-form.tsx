import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Fingerprint } from "lucide-react"

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

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [documento, setDocumento] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Indicador de fortaleza de contraseña
  const { score, label, barClass } = useMemo(() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[a-z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++

    const clamped = Math.min(s, 4)
    const labels = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"]
    const classes = [
      "bg-rose-300",
      "bg-rose-400",
      "bg-amber-400",
      "bg-emerald-400",
      "bg-emerald-500",
    ]
    return {
      score: clamped,
      label: labels[clamped],
      barClass: classes[clamped],
    }
  }, [password])

  const validate = (): string | null => {
    if (!name.trim()) return "Por favor ingresa tu nombre."
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Ingresa un correo válido."
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres."
    if (password !== confirmPassword) return "Las contraseñas no coinciden."
    if (!documento.trim()) return "Ingresa tu DNI o RUC."
    if (!/^\d{8}$/.test(documento) && !/^\d{11}$/.test(documento)) return "El DNI debe tener 8 dígitos o el RUC 11 dígitos."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errorMsg = validate()
    if (errorMsg) {
      toast({ title: "Revisa el formulario", description: errorMsg, variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await api.post("/auth/register", {
        email: email.trim(),
        password,
        name: name.trim(),
        documento: documento.trim(),
        role: "ROLE_CLIENTE",
      })
      toast({
        title: "Cuenta creada",
        description: "Tu registro fue exitoso, ahora puedes iniciar sesión.",
      })
      router.push("/login")
    } catch (error: any) {
      let description = "No se pudo registrar la cuenta"
      if (error?.message) description = error.message
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
      <div
        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-300/50 via-rose-300/40 to-amber-400/50 opacity-70 blur-[2px] dark:from-amber-400/20 dark:via-rose-400/15 dark:to-amber-500/20"
        aria-hidden="true"
      />
      <Card className="relative w-full overflow-hidden rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader className="space-y-2 pt-7 pb-2 md:pt-9 md:pb-3">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 md:text-[26px]">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center leading-relaxed text-stone-600 dark:text-stone-300">
            Únete a Delicia y disfruta del sabor artesanal 🥖
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-6 md:space-y-7">
            {/* Nombre */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-stone-700 dark:text-stone-200">
                Nombre
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 pl-10 text-[15px] placeholder:text-stone-400 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-stone-700 dark:text-stone-200">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
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
                  className="h-11 md:h-12 pl-10 text-[15px] placeholder:text-stone-400 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
                />
              </div>
            </div>

            {/* DNI/RUC */}
            <div className="space-y-3">
              <Label htmlFor="documento" className="text-stone-700 dark:text-stone-200">
                DNI/RUC
              </Label>
              <div className="relative">
                <Fingerprint
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="documento"
                  type="text"
                  placeholder="DNI (8 dígitos) o RUC (11 dígitos)"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={11}
                  className="h-11 md:h-12 pl-10 text-[15px] placeholder:text-stone-400 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
                />
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Ingresa tu DNI (8 dígitos) o RUC (11 dígitos) para tu comprobante.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-stone-700 dark:text-stone-200">
                  Contraseña
                </Label>
                <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Recomendado 8+ caracteres
                </div>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 pl-10 pr-11 text-[15px] placeholder:text-stone-400 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-300"
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

              {/* Barra de fortaleza */}
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className={`h-1.5 rounded-full transition-all ${barClass}`}
                    style={{ width: `${(score / 4) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                  Fortaleza: <span className="font-medium">{label}</span>
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-stone-700 dark:text-stone-200">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 md:h-12 pl-10 pr-11 text-[15px] placeholder:text-stone-400 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition-colors hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-rose-500">Las contraseñas no coinciden.</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 pt-2 md:pt-3">
            <Button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-rose-400 text-white shadow-lg shadow-rose-200/40 transition-all hover:from-amber-600 hover:to-rose-500 hover:shadow-rose-300/50 focus-visible:ring-amber-400 disabled:opacity-70 dark:shadow-none"
              disabled={isLoading}
            >
              <span className="relative flex w-full items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>Crear cuenta</>
                )}
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 transition-transform duration-700 ease-out group-hover:translate-x-full" />
            </Button>

            <p className="text-center text-sm text-stone-600 dark:text-stone-300">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-amber-700 underline-offset-4 transition-colors hover:text-amber-800 hover:underline dark:text-amber-300 dark:hover:text-amber-200"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}