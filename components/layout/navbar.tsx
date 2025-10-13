"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu } from "lucide-react"

import { useAuth } from "@/hooks/use-auth" // ← usa el hook corregido
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth() // ← ahora obtienes logout del hook
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (itemCount > 0) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 450)
      return () => clearTimeout(t)
    }
  }, [itemCount])

  const userInitial = useMemo(() => (user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"), [user?.name])

  const handleLogout = () => {
    logout() // ← llama al logout del hook (dispara evento y refresca el estado)
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/75 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-stone-950/60">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent dark:via-amber-400/20" />
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-300 text-white shadow-sm ring-4 ring-white/70 transition-transform group-hover:scale-105 dark:ring-white/10">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true" fill="currentColor">
              <path d="M11 2a1 1 0 0 1 2 0v5.09a7.5 7.5 0 0 1 4.91 4.91H23a1 1 0 1 1 0 2h-5.09a7.5 7.5 0 0 1-4.91 4.91V22a1 1 0 1 1-2 0v-3.09a7.5 7.5 0 0 1-4.91-4.91H1a1 1 0 1 1 0-2h5.09A7.5 7.5 0 0 1 11 7.09V2z" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Delicia
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/catalogo">
            <Button variant="ghost" className="rounded-lg text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100">
              Catálogo
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2.5">
          <div className="hidden md:block">
            <Link href="/catalogo">
              <Button variant="brand" size="lg" className="rounded-xl">
                Haz tu pedido
              </Button>
            </Link>
          </div>

          <Link href="/carrito" className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
            </Button>
            {itemCount > 0 && (
              <div className="absolute -right-1 -top-1">
                <span
                  className={[
                    "absolute inset-0 rounded-full bg-rose-400/50",
                    bump ? "animate-ping" : "hidden",
                  ].join(" ")}
                />
                <Badge
                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 p-0 text-[11px] font-semibold text-white shadow-sm ring-2 ring-white/80 dark:ring-stone-900"
                  variant="secondary"
                >
                  {itemCount}
                </Badge>
              </div>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-white/70 bg-white/60 shadow-sm hover:bg-white/90 dark:border-white/10 dark:bg-stone-900/60 dark:hover:bg-stone-900/80"
                    aria-label="Menú de usuario"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-[13px] font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                      {userInitial || <User className="h-5 w-5" />}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-400 text-white">
                        {userInitial}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {user?.role === "ROLE_CLIENTE" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/cliente/perfil" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/cliente/pedidos" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          Mis Pedidos
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user?.role === "ROLE_TRABAJADOR" && (
                    <DropdownMenuItem asChild>
                      <Link href="/trabajador" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Panel de Trabajo
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user?.role === "ROLE_ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Panel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/catalogo" className="cursor-pointer">
                        Catálogo
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-1.5">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-lg">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="brand" className="rounded-xl">
                    Registrarse
                  </Button>
                </Link>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/catalogo" className="cursor-pointer">
                        Catálogo
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="cursor-pointer">
                        Iniciar Sesión
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/registro" className="cursor-pointer">
                        Registrarse
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      <motion.div
        className="pointer-events-none h-px w-full bg-black/0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      />
    </nav>
  )
}