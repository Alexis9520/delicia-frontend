"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { OrderCard } from "@/components/orders/order-card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { Package } from "lucide-react"
import Link from "next/link"

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/orders")
      setOrders(response)
    } catch (error) {
      // Mock data for development
      setOrders([
        {
          id: "order-1",
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
        },
        {
          id: "order-2",
          userId: "user-1",
          items: [
            {
              id: "3",
              name: "Pastel de Chocolate",
              description: "Delicioso pastel de chocolate con ganache",
              price: 25.0,
              category: "pasteles",
              image: "/decadent-chocolate-cake.png",
              stock: 5,
              available: true,
              quantity: 1,
            },
          ],
          total: 25.0,
          status: "entregado",
          address: {
            street: "Calle Secundaria 456",
            city: "Guadalajara",
            state: "Jalisco",
            zipCode: "44100",
            country: "México",
            phone: "+52 333 444 5555",
          },
          paymentMethod: "PayPal",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = (status?: Order["status"]) => {
    if (!status) return orders
    return orders.filter((order) => order.status === status)
  }

  const getOrdersByTab = () => {
    switch (activeTab) {
      case "activos":
        return orders.filter((o) => ["pendiente", "en_preparacion", "en_camino"].includes(o.status))
      case "completados":
        return orders.filter((o) => o.status === "entregado")
      case "cancelados":
        return orders.filter((o) => o.status === "cancelado")
      default:
        return orders
    }
  }

  const filteredOrders = getOrdersByTab()

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["cliente"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["cliente"]}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Mis Pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">No tienes pedidos aún</h2>
            <p className="text-muted-foreground mb-8">Comienza a explorar nuestro catálogo</p>
            <Button asChild size="lg">
              <Link href="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="todos">Todos ({orders.length})</TabsTrigger>
              <TabsTrigger value="activos">
                Activos ({orders.filter((o) => ["pendiente", "en_preparacion", "en_camino"].includes(o.status)).length})
              </TabsTrigger>
              <TabsTrigger value="completados">
                Completados ({orders.filter((o) => o.status === "entregado").length})
              </TabsTrigger>
              <TabsTrigger value="cancelados">
                Cancelados ({orders.filter((o) => o.status === "cancelado").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay pedidos en esta categoría</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  )
}
