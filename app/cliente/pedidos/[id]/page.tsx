"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { ArrowLeft, MapPin, CreditCard, Package, Truck, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusSteps = () => {
    const steps = [
      { id: "pendiente", label: "Pendiente", icon: Package },
      { id: "en_preparacion", label: "En Preparación", icon: Package },
      { id: "en_camino", label: "En Camino", icon: Truck },
      { id: "entregado", label: "Entregado", icon: CheckCircle },
    ]

    const statusOrder = ["pendiente", "en_preparacion", "en_camino", "entregado"]
    const currentIndex = statusOrder.indexOf(order?.status || "pendiente")

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["cliente"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={["cliente"]}>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">Pedido no encontrado</p>
        </div>
      </ProtectedRoute>
    )
  }

  const statusSteps = getStatusSteps()

  return (
    <ProtectedRoute allowedRoles={["cliente"]}>
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

        {/* Status Timeline */}
        {order.status !== "cancelado" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Estado del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          step.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs mt-2 text-center font-medium">{step.label}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step.completed ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
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
                    <p className="text-sm text-muted-foreground mt-1">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.zipCode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-2 text-muted-foreground">Tel: {order.address.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{order.paymentMethod}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
