"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem, Address } from "@/lib/types"
import Image from "next/image"

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
    card: "Tarjeta de Crédito/Débito",
    paypal: "PayPal",
    cash: "Efectivo al recibir",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dirección de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.zipCode}
          </p>
          <p>{address.country}</p>
          <p className="mt-2 text-muted-foreground">Tel: {address.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{paymentLabels[paymentMethod]}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impuestos</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent" disabled={isLoading}>
          Volver
        </Button>
        <Button onClick={onConfirm} className="flex-1" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  )
}
