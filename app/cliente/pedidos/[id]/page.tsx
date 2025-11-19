"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, CreditCard, MapPin, PackageCheck, Truck, FileText } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"
import { ComprobanteCard } from "@/components/client/ComprobanteCard"

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Comprobante SUNAT
  const [comprobante, setComprobante] = useState<any | null>(null)
  const [facturando, setFacturando] = useState(false)
  const [comprobanteError, setComprobanteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/orders/${id}`)
        const data = (res as any)?.data ?? res
        setOrder(data as Order)
      } catch {
        setError("No se pudo cargar el pedido.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  // Obtener comprobante si existe
  useEffect(() => {
    const fetchComprobante = async () => {
      if (!id) return
      try {
        const res = await api.get(`/comprobantes/order/${id}`)
        const data = (res as any)?.data ?? res
        if (data && data.id) setComprobante(data)
        else setComprobante(null)
      } catch {
        setComprobante(null)
      }
    }
    if (order && order.status === "entregado") {
      fetchComprobante()
    }
  }, [id, order])

  // Generar comprobante mock
  const handleGenerarComprobante = async () => {
    setFacturando(true)
    setComprobanteError(null)
    try {
      const res = await api.post(`/comprobantes/generar/${id}`, {})
      const data = (res as any)?.data ?? res
      setComprobante(data)
    } catch (err) {
      setComprobanteError("No se pudo generar el comprobante. Intenta nuevamente.")
    } finally {
      setFacturando(false)
    }
  }

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, shipping: 0, tax: 0, total: 0 }
    // Use server-provided values when present, otherwise compute client-side
    const subtotal =
      typeof (order as any).subtotal === "number"
        ? (order as any).subtotal
        : order.items?.reduce((acc, it) => acc + it.price * it.quantity, 0) ?? 0

    const FREE_SHIPPING = 30
    const TAX_RATE = 0.18

    const shippingComputed = subtotal >= FREE_SHIPPING ? 0 : 5
    const shipping = typeof (order as any).shipping === "number" ? (order as any).shipping : shippingComputed

    const taxComputed = Number((subtotal * TAX_RATE).toFixed(2))
    const tax = typeof (order as any).tax === "number" ? (order as any).tax : taxComputed

    const computedTotal = Number((subtotal + shipping + tax).toFixed(2))
    // If server returned a total that doesn't match the computed breakdown, prefer the computed one
    const serverTotal = typeof (order as any).total === "number" ? (order as any).total : undefined
    const total = typeof serverTotal === "number" && Math.abs(serverTotal - computedTotal) < 0.01 ? serverTotal : computedTotal
    return { subtotal, shipping, tax, total }
  }, [order])

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

  return (
    <ProtectedRoute allowedRoles={["ROLE_CLIENTE"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-700 hover:bg-white/70 dark:text-stone-200 dark:hover:bg-stone-900/60"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </Button>
          </div>

          {loading && (
            <div className="grid gap-6">
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
              <Button onClick={() => router.push("/cliente/pedidos")} variant="brand" className="rounded-xl">
                Ir a mis pedidos
              </Button>
            </div>
          )}

          {!loading && !error && order && (
            <div className="space-y-6">
              {/* Encabezado */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60"
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
                      <span className="hidden text-stone-400 sm:inline">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4" />
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Items */}
                <Card className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold">Productos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-stone-100 dark:bg-stone-800">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || "Producto"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                          <p className="text-sm text-stone-500 dark:text-stone-400">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Resumen */}
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 dark:text-stone-300">Subtotal</span>
                        <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300">
                          <Truck className="h-4 w-4" /> Envío
                        </span>
                        <span className="font-semibold">{formatCurrency(totals.shipping)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 dark:text-stone-300">Impuestos</span>
                        <span className="font-semibold">{formatCurrency(totals.tax)}</span>
                      </div>
                      <Separator className="my-2 bg-stone-200 dark:bg-stone-800" />
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-amber-700 dark:text-amber-300">{formatCurrency(totals.total)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Envío y dirección */}
                  <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold">Envío</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                        <div>
                          <p>{order.address?.street}</p>
                          <p>
                            {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                          </p>
                          <p>{order.address?.country}</p>
                        </div>
                      </div>
                      {order.status === "entregado" && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-emerald-700 dark:text-emerald-300">
                          <PackageCheck className="h-4 w-4" />
                          Entregado
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1 rounded-xl">
                      <Link href="/cliente/pedidos">Ver todos los pedidos</Link>
                    </Button>
                    <Button asChild variant="brand" className="flex-1 rounded-xl">
                      <Link href="/catalogo">Seguir comprando</Link>
                    </Button>
                  </div>
                </div>
              </div>
              {/* Comprobante electrónico SUNAT */}
              {order.status === "entregado" && (
                <Card className="rounded-2xl border border-dashed border-amber-500 bg-white/90 shadow-xl backdrop-blur-md dark:border-amber-300 dark:bg-stone-950/70 mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-300 flex gap-2 items-center">
                      <FileText className="h-5 w-5" />
                      Comprobante Electrónico SUNAT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comprobante ? (
                      <ComprobanteCard comprobante={comprobante} />
                    ) : (
                      <>
                        {comprobanteError && (
                          <div className="mb-2 text-sm text-rose-600 dark:text-rose-400">{comprobanteError}</div>
                        )}
                        <Button onClick={handleGenerarComprobante} disabled={facturando} variant="brand" className="rounded-xl">
                          {facturando ? "Generando comprobante..." : "Generar comprobante SUNAT"}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}