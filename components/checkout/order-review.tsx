"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem, Address } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface OrderReviewProps {
  items: CartItem[]
  address: Address
  paymentMethod: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  onConfirm: () => void
  onBack: () => void
  isLoading?: boolean
}

export function OrderReview({
  items,
  address,
  paymentMethod,
  subtotal,
  shipping,
  tax,
  total,
  onConfirm,
  onBack,
  isLoading,
}: OrderReviewProps) {
  const paymentLabels: Record<string, string> = {
    stripe: "Tarjeta (Stripe)",
    card: "Tarjeta de Crédito/Débito",
    paypal: "PayPal",
    cash: "Efectivo al recibir",
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-stone-100 dark:bg-stone-800">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
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

      <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Dirección de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="text-stone-700 dark:text-stone-300">
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.zipCode}
          </p>
          <p>{address.country}</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Tel: {address.phone}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Método de Pago</CardTitle>
        </CardHeader>
        <CardContent className="text-stone-700 dark:text-stone-300">
          <p>{paymentLabels[paymentMethod] ?? paymentMethod}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-300">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-300">Envío</span>
            <span className="font-semibold">{formatCurrency(shipping)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-300">Impuestos</span>
            <span className="font-semibold">{formatCurrency(tax)}</span>
          </div>
          <Separator className="bg-stone-200 dark:bg-stone-800" />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-amber-700 dark:text-amber-300">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          Volver
        </Button>
        <Button onClick={onConfirm} className="flex-1" variant="brand" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  )
}