"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, CreditCard, MapPin, Phone, Loader2 } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

export default function WorkerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/orders/worker/${id}`)
      const data = (response as any)?.data ?? response
      setOrder(data as Order)
    } catch {
      // Mock de desarrollo si el backend falla
      setOrder({
        id: String(id),
        userId: "user-1",
        items: [
          {
            id: "1",
            name: "Pan Francés",
            description: "Pan crujiente recién horneado",
            price: 2.5,
            category: "panes",
            image: "/french-bread.png",
            stock: 20,
            available: true,
            quantity: 2,
          },
          {
            id: "2",
            name: "Croissant",
            description: "Croissant de mantequilla artesanal",
            price: 3.0,
            category: "panes",
            image: "/golden-croissant.png",
            stock: 15,
            available: true,
            quantity: 3,
          },
        ],
        total: 14.0,
        status: "en_preparacion",
        address: {
          street: "Av. Principal 123",
          city: "Lima",
          state: "Lima",
          zipCode: "15000",
          country: "Perú",
          phone: "+51 999 999 999",
        },
        paymentMethod: "Tarjeta",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast({
        title: "Modo demostración",
        description: "Mostrando datos de ejemplo al fallar la carga desde el servidor.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return
    setIsUpdating(true)
    const prev = order
    setOrder({ ...order, status: newStatus })
    try {
      await api.put(`/orders/${order.id}/status`, { status: newStatus })
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente",
      })
    } catch {
      setOrder(prev)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("es-PE", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-"

  const computedSubtotal = useMemo(
    () => order?.items?.reduce((acc, it) => acc + it.price * it.quantity, 0) ?? 0,
    [order],
  )

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ROLE_TRABAJADOR"]}>
        <main className="flex min-h-[60vh] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
          <Spinner className="h-8 w-8" />
        </main>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={["ROLE_TRABAJADOR"]}>
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
          <p className="text-center text-stone-500 dark:text-stone-400">Pedido no encontrado</p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/trabajador")}>
              Volver al panel
            </Button>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_TRABAJADOR"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-lg px-3 py-2 text-stone-700 hover:bg-white/70 dark:text-stone-200 dark:hover:bg-stone-900/60"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a pedidos
            </Button>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-balance text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
                  Pedido #{String(order.id).slice(0, 8)}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </motion.div>

          {/* Actualizar estado */}
          <Card className="mb-6 rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Actualizar estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  value={order.status}
                  onValueChange={(v) => handleStatusChange(v as Order["status"])}
                  disabled={isUpdating || order.status === "entregado" || order.status === "cancelado"}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl sm:w-72">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_preparacion">En Preparación</SelectItem>
                    <SelectItem value="en_camino">En Camino</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                {isUpdating && (
                  <div className="inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando cambios...
                  </div>
                )}
              </div>
              {(order.status === "entregado" || order.status === "cancelado") && (
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  Este pedido ya está {order.status === "entregado" ? "entregado" : "cancelado"} y no se puede modificar.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Productos */}
            <Card className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">Productos del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-stone-100 dark:bg-stone-800">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name ? `Imagen de ${item.name}` : "Imagen del producto"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{item.name}</p>
                      <p className="line-clamp-2 text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        Cantidad: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-stone-900 dark:text-stone-100">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator className="my-2 bg-stone-200 dark:bg-stone-800" />

                <div className="flex items-center justify-between text-base">
                  <span className="text-stone-600 dark:text-stone-300">Subtotal</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {formatCurrency(computedSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total del pedido</span>
                  <span className="text-amber-700 dark:text-amber-300">{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información de entrega y pago */}
            <div className="space-y-6">
              <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <MapPin className="h-5 w-5" />
                    Dirección de entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-stone-700 dark:text-stone-300">
                  <p className="font-medium">{order.address.street}</p>
                  <p>
                    {order.address.city}, {order.address.state}
                  </p>
                  <p>{order.address.zipCode}</p>
                  <p>{order.address.country}</p>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-stone-400" />
                    <span>{order.address.phone}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <CreditCard className="h-5 w-5" />
                    Información de pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-stone-700 dark:text-stone-300">
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Método de pago</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Total pagado</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}