"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/currency"
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown, Archive } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"

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

  const [dashboard, setDashboard] = useState<any | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Intentar obtener el dashboard desde el backend
      const resp = await api.get("/admin/dashboard")
      // Resp espera la forma documentada en la API: { kpis, lowStock, topSold, topMermas, ventasPorTrabajador, ventasMostradorPorHora, ultimosMovimientos }
      setDashboard(resp)
      // Para compatibilidad con las tarjetas superiores, mapear algunos valores a `stats` fallback
      if (resp?.kpis) {
        setStats((s) => ({
          ...s,
          totalRevenue: Number(resp.kpis.ventasTotalesHoy ?? s.totalRevenue),
          totalOrders: Number(resp.kpis.pedidosTotalesHoy ?? s.totalOrders),
        }))
      }
      // Si el backend no incluye conteos de productos/usuarios, obtenerlos por separado
      if (!resp?.totalProducts) {
        try {
          const products = await api.get("/products")
          let count = 0
          if (Array.isArray(products)) count = products.length
          else if (products && Array.isArray((products as any).content)) count = (products as any).content.length
          else if (products && Array.isArray((products as any).data)) count = (products as any).data.length
          setStats((s) => ({ ...s, totalProducts: count || s.totalProducts }))
        } catch (e) {
          // ignore
        }
      } else {
        setStats((s) => ({ ...s, totalProducts: Number(resp.totalProducts) }))
      }

      if (!resp?.totalUsers) {
        try {
          const users = await api.get("/users")
          let count = 0
          if (Array.isArray(users)) count = users.length
          else if (users && Array.isArray((users as any).content)) count = (users as any).content.length
          else if (users && Array.isArray((users as any).data)) count = (users as any).data.length
          setStats((s) => ({ ...s, totalUsers: count || s.totalUsers }))
        } catch (e) {
          // ignore
        }
      } else {
        setStats((s) => ({ ...s, totalUsers: Number(resp.totalUsers) }))
      }
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

  const formatRate = (v: any) => {
    if (v == null || v === "") return "-"
    const n = Number(v)
    if (!Number.isFinite(n)) return "-"
    // Mostrar hasta 2 decimales y quitar ceros finales (p. ej. 0.08 en vez de 0.083333...)
    return n.toLocaleString('es-PE', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  }

  const statsCards = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(Number(stats.totalRevenue || 0)),
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
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
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

              {/* Nuevo: botón / enlace directo a la Auditoría de Inventario */}
              <Link href="/admin/inventario" className="block">
                <button
                  type="button"
                  className="w-full mt-2 flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors text-left"
                >
                  <Archive className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Ver Inventario</p>
                    <p className="text-sm text-muted-foreground">Auditoría y movimientos de stock</p>
                  </div>
                </button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pedidos Hoy</span>
                <span className="font-bold">{dashboard?.kpis?.pedidosTotalesHoy ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ingresos Hoy</span>
                <span className="font-bold">{dashboard?.kpis ? formatCurrency(Number(dashboard.kpis.ventasTotalesHoy || 0)) : formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">% Merma</span>
                <span className="font-bold">{dashboard?.kpis?.tasaMermaPct != null ? `${Number(dashboard.kpis.tasaMermaPct).toFixed(1)}%` : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">% Online</span>
                <span className="font-bold">{dashboard?.kpis?.mixOnlinePct != null ? `${Number(dashboard.kpis.mixOnlinePct).toFixed(0)}%` : '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fila media: métricas y gráficos simples */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Producción vs Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple summary: agrupar por tipo en ultimosMovimientos */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Velocidad mostrador (por hora)</div>
                <div className="text-2xl font-bold">{formatRate(dashboard?.ventasMostradorPorHora ?? dashboard?.kpis?.ventasMostradorPorHora)} / h</div>
                <div className="mt-3 text-sm text-muted-foreground">Top vendidos</div>
                <div className="h-36 w-full">
                  <ChartContainer
                    config={{ topSold: { color: '#0ea5a4' } }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(dashboard?.topSold || []).slice(0,5).map((p: any) => ({ name: p.name, value: p.value }))}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <ReTooltip />
                        <Bar dataKey="value" fill="#0ea5a4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventas por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ChartContainer config={{ canal: { color: '#f97316' } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Online', value: dashboard?.kpis?.mixOnlinePct ?? 0 },
                          { name: 'Mostrador', value: dashboard?.kpis?.mixMostradorPct ?? 0 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                        label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                      >
                        <Cell fill="#06b6d4" />
                        <Cell fill="#f97316" />
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fila inferior: low stock y últimos movimientos */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              {(!dashboard?.lowStock || dashboard.lowStock.length === 0) ? (
                <div className="text-sm text-muted-foreground">No hay productos con stock bajo</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Producto</th>
                      <th className="py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.lowStock.map((p: any) => (
                      <tr key={p.productId} className={`border-b ${p.value < 10 ? 'bg-red-50' : ''}`}>
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 font-semibold">{p.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Movimientos de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              {(!dashboard?.ultimosMovimientos || dashboard.ultimosMovimientos.length === 0) ? (
                <div className="text-sm text-muted-foreground">No hay movimientos recientes</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-auto">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Fecha</th>
                        <th className="py-2">Producto</th>
                        <th className="py-2">Tipo</th>
                        <th className="py-2">Cantidad</th>
                        <th className="py-2">Motivo</th>
                        <th className="py-2">Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard.ultimosMovimientos || []).slice(0,10).map((m: any) => (
                        <tr key={m.id} className="border-b">
                          <td className="py-2">{m.createdAt ? new Date(m.createdAt).toLocaleString('es-PE') : '-'}</td>
                          <td className="py-2">{m.productoNombre ?? m.productoId ?? '-'}</td>
                          <td className="py-2">{m.tipo}</td>
                          <td className="py-2">{m.cantidad}</td>
                          <td className="py-2">{m.motivo}</td>
                          <td className="py-2">{m.referenciaTipo ? `${m.referenciaTipo} #${m.referencia}` : m.referencia || '-'}</td>
                        </tr>
                      ))}
                      {dashboard.ultimosMovimientos && dashboard.ultimosMovimientos.length > 10 && (
                        <tr>
                          <td colSpan={6} className="py-2 text-sm text-muted-foreground">Mostrando 10 de {dashboard.ultimosMovimientos.length} movimientos recientes</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}