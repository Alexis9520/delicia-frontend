"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "./order-status-badge"
import type { Order } from "@/lib/types"
import { Calendar, MapPin, CreditCard } from "lucide-react"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
            <div className="flex items-center gap-2 mt-1">
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
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-sm text-muted-foreground">+{order.items.length - 3} productos más</p>
          )}
        </div>

        <div className="pt-2 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              {order.address.street}, {order.address.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">{order.paymentMethod}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
        </div>
        <Button asChild>
          <Link href={`/cliente/pedidos/${order.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
