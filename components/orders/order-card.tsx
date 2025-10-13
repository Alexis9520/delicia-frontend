"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, CreditCard } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import type { Order } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface OrderCardProps {
  order: Order
  // Si proporcionas href, renderiza el CTA como Link dentro del card (sin envolver el card completo)
  href?: string
}

export function OrderCard({ order, href }: OrderCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const paymentLabels: Record<string, string> = {
    stripe: "Tarjeta (Stripe)",
    card: "Tarjeta",
    paypal: "PayPal",
    cash: "Efectivo",
  }

  return (
    <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pedido #{String(order.id).slice(0, 8)}</p>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name ? `Imagen de ${item.name}` : "Imagen del producto"}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 3} productos más
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground">
              {order.address.street}, {order.address.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(order.total)}
          </p>
        </div>

        {href ? (
          <Button className="rounded-xl" variant="brand" asChild>
            <Link href={href}>Ver Detalles</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}