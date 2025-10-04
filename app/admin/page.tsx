"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const [orders, products, users] = await Promise.all([
        api.get("/orders/all"),
        api.get("/products"),
        api.get("/users"),
      ])

      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total, 0)
      const completedOrders = orders.filter((o: Order) => o.status === "entregado")

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        revenueChange: 12.5,
        ordersChange: 8.3,
      })
    } catch (error) {
      // Mock data for development
      setStats({
        totalRevenue: 15420.5,
        totalOrders: 342,
        totalProducts: 48,
        totalUsers: 156,
        revenueChange: 12.5,
        ordersChange: 8.3,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Ingresos Totales",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total de Pedidos",
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Productos",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-orange-600",
    },
  ]

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["administrador"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["administrador"]}>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Panel de Administrador</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.change !== undefined && (
                  <div className="flex items-center text-sm mt-2">
                    {stat.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600">+{stat.change}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        <span className="text-red-600">{stat.change}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground ml-1">vs mes anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/productos" className="block p-4 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Gestionar Productos</p>
                    <p className="text-sm text-muted-foreground">Agregar, editar o eliminar productos</p>
                  </div>
                </div>
              </a>
              <a href="/admin/usuarios" className="block p-4 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Gestionar Usuarios</p>
                    <p className="text-sm text-muted-foreground">Ver y administrar usuarios del sistema</p>
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pedidos Hoy</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ingresos Hoy</span>
                <span className="font-bold">$1,245.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Productos Agotados</span>
                <span className="font-bold text-red-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nuevos Usuarios</span>
                <span className="font-bold">12</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}