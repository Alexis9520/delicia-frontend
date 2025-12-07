"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Package, Clock, Truck, CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderTableRow } from "@/components/worker/order-table-row"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Order, PaginatedResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import VentaMostradorModal from "@/components/worker/venta-mostrador-modal"
import dynamic from "next/dynamic"

const ProductionModal = dynamic(() => import("@/components/worker/production-modal"), { ssr: false })

type TabKey = "todos" | "pendiente" | "en_preparacion" | "en_camino" | "entregado" | "mostrador"

export default function TrabajadorPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("todos")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  const { toast } = useToast()
  const abortRef = useRef<AbortController | null>(null)
  const [showVentaModal, setShowVentaModal] = useState(false)
  const [showProductionModal, setShowProductionModal] = useState(false)

  useEffect(() => {
    // Reset page to 1 on tab change, then fetch
    setPage(1)
    fetchOrders(1, activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    fetchOrders(page, activeTab)
    return () => {
      abortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const fetchOrders = async (currentPage = page, status: TabKey = activeTab) => {
    setIsLoading(true)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const params: any = {
        page: currentPage,
        pageSize,
        sort: "id,desc"
      }

      if (status !== "todos") {
        if (status === "mostrador") {
          params.canal = "mostrador"
        } else {
          params.status = status
        }
      }

      const response = await api.get<PaginatedResponse<Order>>("/orders/all", params)

      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        setOrders(response.data)
        setTotalPages(response.totalPages || 1)
      } else if (Array.isArray(response)) {
        setOrders(response)
        setTotalPages(1) // Fallback
      } else {
        setOrders([])
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error(error)
      setOrders([])
      setLastUpdated(new Date())
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los pedidos.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    // Optimistic update
    const prev = orders
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente",
      })
    } catch (error) {
      setOrders(prev)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  // No filteredOrders useMemo anymore because orders are already filtered by server

  // Removed detailed "Stats" calculation based on local array since we only have one page.
  // We can't accurately show "Pendientes (5)" if we don't have all data.
  // For the Stats cards at top, we would need a separate API call api.get('/orders/stats').
  // Assuming we don't have that yet, we will hide the specific counts or show dashes.

  // Removed filteredOrders useMemo and detailed stats due to server-side pagination
  const stats = [
    {
      title: "Pendientes",
      value: activeTab === 'pendiente' ? orders.length : "-",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "En Preparación",
      value: activeTab === 'en_preparacion' ? orders.length : "-",
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: "En Camino",
      value: activeTab === 'en_camino' ? orders.length : "-",
      icon: Truck,
      color: "text-sky-600",
    },
    {
      title: "Completados",
      value: activeTab === 'entregado' ? orders.length : "-",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Ventas mostrador",
      value: activeTab === 'mostrador' ? orders.length : "-",
      icon: Package,
      color: "text-pink-600",
    },
  ]

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ROLE_TRABAJADOR"]}>
        <main className="flex min-h-[60vh] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
          <Spinner className="h-8 w-8" />
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_TRABAJADOR"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 sm:text-5xl"
            >
              Panel de Trabajo
            </motion.h1>

            <div className="flex items-center gap-2">
              {lastUpdated && (
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Actualizado:{" "}
                  <span className="font-medium">
                    {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
              )}
              <Button onClick={() => fetchOrders(1, activeTab)} variant="outline" className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refrescar
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setShowVentaModal(true)} variant="brand" className="rounded-xl">
                Registrar venta mostrador
              </Button>
              <Button onClick={() => setShowProductionModal(true)} variant="secondary" className="rounded-xl">
                Registrar producción
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => (
              <Card key={stat.title} className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabla de pedidos */}
          <Card className="transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Gestión de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                  <TabsTrigger value="en_preparacion">En Preparación</TabsTrigger>
                  <TabsTrigger value="en_camino">En Camino</TabsTrigger>
                  <TabsTrigger value="entregado">Completados</TabsTrigger>
                  <TabsTrigger value="mostrador">Mostrador</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {orders.length === 0 ? (
                    <p className="py-10 text-center text-stone-500 dark:text-stone-400">
                      No hay pedidos en esta categoría
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Canal</TableHead>
                            <TableHead>Actualizar</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <OrderTableRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {showVentaModal && (
          <VentaMostradorModal
            onClose={() => setShowVentaModal(false)}
            onVentaRegistrada={fetchOrders}
          />
        )}
        {showProductionModal && (
          <ProductionModal
            onClose={() => setShowProductionModal(false)}
            onProcessed={() => {
              toast({ title: "Producción registrada", description: "Se actualizó el stock." })
            }}
          />
        )}
      </main>
    </ProtectedRoute >
  )
}