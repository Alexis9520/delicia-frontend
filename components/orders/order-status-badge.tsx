import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"

interface OrderStatusBadgeProps {
  status: Order["status"]
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pendiente: { label: "Pendiente", variant: "secondary" as const },
    en_preparacion: { label: "En Preparación", variant: "default" as const },
    en_camino: { label: "En Camino", variant: "default" as const },
    entregado: { label: "Entregado", variant: "default" as const },
    cancelado: { label: "Cancelado", variant: "destructive" as const },
  }

  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
