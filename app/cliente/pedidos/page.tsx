"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FolderOpen, RefreshCw } from "lucide-react"
import Link from "next/link"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderCard } from "@/components/orders/order-card"
import type { Order } from "@/lib/types"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get("/orders")
      const data = (res as any)?.data ?? res
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setError("No se pudieron cargar los pedidos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["ROLE_CLIENTE"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 sm:text-5xl"
          >
            Mis pedidos
          </motion.h1>

          {loading && (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-stone-900/50"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-center shadow-md backdrop-blur-md dark:border-white/10 dark:bg-stone-900/60">
              <p className="mb-4 text-stone-700 dark:text-stone-200">{error}</p>
              <Button onClick={fetchOrders} variant="brand" className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/60 bg-white/80 p-10 text-center shadow-md backdrop-blur-md dark:border-white/10 dark:bg-stone-900/60">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <FolderOpen className="h-7 w-7" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
                    No tienes pedidos aún
                  </p>
                  <p className="mb-6 text-stone-600 dark:text-stone-300">
                    Explora el catálogo y comienza tu primer pedido.
                  </p>
                  <Button asChild variant="brand" className="rounded-xl">
                    <Link href="/catalogo">Ir al catálogo</Link>
                  </Button>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    className="group"
                  >
                    {/* Sin envolver el Card con Link externo; pasa el href al Card */}
                    <OrderCard order={order} href={`/cliente/pedidos/${order.id}`} />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}