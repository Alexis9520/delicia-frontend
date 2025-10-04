"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { ArrowLeft, MapPin, CreditCard, Phone } from "lucide-react"
import Image from "next/image"

export default function WorkerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/orders/${params.id}`)
      setOrder(response)
    } catch (error) {
      // Mock data for development
      setOrder({
        id: params.id as string,
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
          city: "Ciudad de México",
          state: "CDMX",
          zipCode: "12345",
          country: "México",
          phone: "+52 123 456 7890",
        },
        paymentMethod: "Tarjeta de Crédito",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return

    setIsUpdating(true)
    try {
      await api.put(`/orders/${order.id}/status`, { status: newStatus })
      setOrder({ ...order, status: newStatus })
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["trabajador"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={["trabajador"]}>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">Pedido no encontrado</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["trabajador"]}>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pedidos
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Status Update */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Actualizar Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating || order.status === "entregado" || order.status === "cancelado"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_preparacion">En Preparación</SelectItem>
                  <SelectItem value="en_camino">En Camino</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(order.status === "entregado" || order.status === "cancelado") && (
              <p className="text-sm text-muted-foreground mt-2">
                Este pedido ya está {order.status === "entregado" ? "entregado" : "cancelado"} y no se puede modificar
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Productos del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cantidad: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total del Pedido</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Delivery Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state}
                </p>
                <p>{order.address.zipCode}</p>
                <p>{order.address.country}</p>
                <Separator className="my-3" />
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{order.address.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pagado</p>
                  <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
