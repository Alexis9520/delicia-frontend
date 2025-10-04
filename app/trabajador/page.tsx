"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderTableRow } from "@/components/worker/order-table-row"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"
import { Package, Clock, Truck, CheckCircle } from "lucide-react"

export default function TrabajadorPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todos")
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/orders/all")
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
          ],
          total: 14.0,
          status: "pendiente",
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
          userId: "user-2",
          items: [
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
          total: 25.0,
          status: "en_preparacion",
          address: {
            street: "Calle Secundaria 456",
            city: "Guadalajara",
            state: "Jalisco",
            zipCode: "44100",
            country: "México",
            phone: "+52 333 444 5555",
          },
          paymentMethod: "PayPal",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "order-3",
          userId: "user-3",
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
          total: 30.0,
          status: "en_camino",
          address: {
            street: "Blvd. Tercero 789",
            city: "Monterrey",
            state: "Nuevo León",
            zipCode: "64000",
            country: "México",
            phone: "+52 811 222 3333",
          },
          paymentMethod: "Efectivo",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      )
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
    }
  }

  const getOrdersByTab = () => {
    switch (activeTab) {
      case "pendientes":
        return orders.filter((o) => o.status === "pendiente")
      case "en_preparacion":
        return orders.filter((o) => o.status === "en_preparacion")
      case "en_camino":
        return orders.filter((o) => o.status === "en_camino")
      case "completados":
        return orders.filter((o) => o.status === "entregado")
      default:
        return orders
    }
  }

  const filteredOrders = getOrdersByTab()

  const stats = [
    {
      title: "Pendientes",
      value: orders.filter((o) => o.status === "pendiente").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "En Preparación",
      value: orders.filter((o) => o.status === "en_preparacion").length,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "En Camino",
      value: orders.filter((o) => o.status === "en_camino").length,
      icon: Truck,
      color: "text-purple-600",
    },
    {
      title: "Completados Hoy",
      value: orders.filter(
        (o) => o.status === "entregado" && new Date(o.updatedAt).toDateString() === new Date().toDateString(),
      ).length,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["trabajador"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["trabajador"]}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Panel de Trabajador</h1>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
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

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos ({orders.length})</TabsTrigger>
                <TabsTrigger value="pendientes">
                  Pendientes ({orders.filter((o) => o.status === "pendiente").length})
                </TabsTrigger>
                <TabsTrigger value="en_preparacion">
                  En Preparación ({orders.filter((o) => o.status === "en_preparacion").length})
                </TabsTrigger>
                <TabsTrigger value="en_camino">
                  En Camino ({orders.filter((o) => o.status === "en_camino").length})
                </TabsTrigger>
                <TabsTrigger value="completados">
                  Completados ({orders.filter((o) => o.status === "entregado").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay pedidos en esta categoría</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Dirección</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Actualizar</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
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
    </ProtectedRoute>
  )
}
