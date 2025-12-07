"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, RefreshCw, ChevronLeft, ChevronRight, Package, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderCard } from "@/components/orders/order-card"
import type { Order, PaginatedResponse } from "@/lib/types"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ClientTab = "activos" | "historial" | "todos"

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ClientTab>("activos")

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  const abortRef = useRef<AbortController | null>(null)

  const fetchOrders = async (currentPage = page, tab = activeTab) => {
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const params: any = {
        page: currentPage,
        pageSize,
        sort: "id,desc"
      }

      // Filter by status group based on tab
      if (tab === "activos") {
        // We can't easily send multiple statuses as array unless backend supports it like status=A,B
        // Assuming backend supports comma separated or repeated params. 
        // If not, we might only support strict filtering.
        // Let's try sending standard repeated params for array if lib/api supports it, 
        // OR just rely on "Todos" and client filter if robust backend filter is missing.
        // BUT the user interaction requested classification.
        // Let's assume standard behavior: ?status=pendiente&status=en_preparacion...
        // Does api.ts helper support array? Yes: "v.forEach((x) => url.searchParams.append(k, String(x)));"
        params.status = ["pendiente", "en_preparacion", "en_camino"]
      } else if (tab === "historial") {
        params.status = ["entregado", "cancelado"]
      }
      // "todos" sends no status param -> gets all

      const res = await api.get<PaginatedResponse<Order>>("/orders", params)

      if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
        setOrders(res.data)
        setTotalPages(res.totalPages || 1)
      } else if (Array.isArray(res)) {
        setOrders(res)
        setTotalPages(1)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los pedidos.")
    } finally {
      setLoading(false)
    }
  }

  // Reload when page or tab changes
  useEffect(() => {
    // Reset page to 1 when tab changes, but we need to distinguish change source.
    // Simpler: Just fetch. If tab changed, we might want page 1.
    // We can use a separate effect for tab change.
    fetchOrders(page, activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    setPage(1)
    fetchOrders(1, activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1)
  }

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
              <Button onClick={() => fetchOrders()} variant="brand" className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClientTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="activos" className="text-base">En Curso</TabsTrigger>
                <TabsTrigger value="historial" className="text-base">Historial</TabsTrigger>
                <TabsTrigger value="todos" className="text-base">Todos</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 py-20 text-center dark:border-stone-800 dark:bg-stone-900/50">
                    <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      {activeTab === 'activos' ? <Package className="h-10 w-10 text-amber-600 dark:text-amber-500" /> :
                        activeTab === 'historial' ? <Clock className="h-10 w-10 text-stone-500" /> :
                          <FolderOpen className="h-10 w-10 text-stone-400" />}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-stone-100">
                      {activeTab === 'activos' ? "No tienes pedidos en curso" :
                        activeTab === 'historial' ? "No tienes historial de pedidos" :
                          "No tienes pedidos aún"}
                    </h3>
                    <p className="mb-8 max-w-sm text-stone-500 dark:text-stone-400">
                      {activeTab === 'activos' ? "Tus deliciosos pedidos aparecerán aquí cuando los realices." :
                        "Explora nuestro catálogo y date un gusto hoy mismo."}
                    </p>
                    <Button asChild variant="brand" className="h-12 rounded-xl px-8 text-base">
                      <Link href="/catalogo">Ir al catálogo</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <AnimatePresence mode="popLayout">
                      {orders.map((order, idx) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                        >
                          <OrderCard order={order} href={`/cliente/pedidos/${order.id}`} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Pagination Controls */}
                {orders.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                      className="h-11 w-11 rounded-full border-stone-200 shadow-sm transition-transform active:scale-95 dark:border-stone-800"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Anterior</span>
                    </Button>
                    <span className="min-w-[100px] text-center text-sm font-medium text-stone-600 dark:text-stone-400">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                      className="h-11 w-11 rounded-full border-stone-200 shadow-sm transition-transform active:scale-95 dark:border-stone-800"
                    >
                      <ChevronRight className="h-5 w-5" />
                      <span className="sr-only">Siguiente</span>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}