import { useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import type { Order } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  // Mostrar canal y nombre/DNI si es venta mostrador
  const canal = order.canal || "online"
  const isMostrador = canal === "mostrador"
  const nombreCliente = order.nombreCliente || ""
  const documentoCliente = order.documentoCliente || ""

  return (
    <TableRow>
      <TableCell className="font-medium">#{String(order.id).slice(0, 8)}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        {isMostrador ? (
          <div className="max-w-xs">
            <span className="font-semibold text-pink-700">Mostrador</span>
            {nombreCliente && (
              <div className="truncate text-sm text-stone-700">
                Cliente: {nombreCliente} {documentoCliente && `(${documentoCliente})`}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xs">
            <p className="truncate font-medium">{order.address?.street}</p>
            <p className="truncate text-sm text-muted-foreground">
              {order.address?.city}, {order.address?.state}
            </p>
          </div>
        )}
      </TableCell>
      <TableCell>
        {order.items?.length
          ? order.items.map(item => (
              <div key={item.id}>
                {item.name} x{item.quantity}
              </div>
            ))
          : "—"}
      </TableCell>
      <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <span className={isMostrador ? "text-pink-700 font-bold" : "text-stone-700"}>
          {canal.charAt(0).toUpperCase() + canal.slice(1)}
        </span>
      </TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={(v) => handleStatusChange(v as Order["status"])}
          disabled={
            isUpdating ||
            order.status === "entregado" ||
            order.status === "cancelado" ||
            isMostrador // no cambiar estado en mostrador
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cambiar estado" />
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
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href={`/trabajador/pedidos/${order.id}`} aria-label="Ver detalles del pedido">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}