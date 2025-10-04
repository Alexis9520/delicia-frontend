"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import type { Order } from "@/lib/types"
import { Eye } from "lucide-react"
import Link from "next/link"

interface OrderTableRowProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void
}

export function OrderTableRow({ order, onStatusChange }: OrderTableRowProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setIsUpdating(true)
    await onStatusChange(order.id, newStatus)
    setIsUpdating(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <TableRow>
      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <div className="max-w-xs">
          <p className="font-medium truncate">{order.address.street}</p>
          <p className="text-sm text-muted-foreground truncate">
            {order.address.city}, {order.address.state}
          </p>
        </div>
      </TableCell>
      <TableCell>{order.items.length} productos</TableCell>
      <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={handleStatusChange}
          disabled={isUpdating || order.status === "entregado" || order.status === "cancelado"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_preparacion">En Preparación</SelectItem>
            <SelectItem value="en_camino">En Camino</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/trabajador/pedidos/${order.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver detalles</span>
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
