"use client"

import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"
import { Clock, ChefHat, Truck, CheckCircle2, XCircle, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: Order["status"] | string
  className?: string
}

type StatusKey =
  | "pendiente"
  | "pending"
  | "enpreparacion"
  | "processing"
  | "encamino"
  | "shipped"
  | "entregado"
  | "delivered"
  | "cancelado"
  | "canceled"
  | "cancelled"

const normalize = (value: string) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // sin acentos
    .replace(/[\s_-]/g, "") // sin espacios/guiones/underscores

const STATUS_MAP: Record<
  StatusKey,
  {
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    classes: string
  }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    classes:
      "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    classes:
      "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  },
  enpreparacion: {
    label: "En preparación",
    icon: ChefHat,
    classes:
      "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/20",
  },
  processing: {
    label: "En preparación",
    icon: ChefHat,
    classes:
      "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/20",
  },
  encamino: {
    label: "En camino",
    icon: Truck,
    classes:
      "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/20",
  },
  shipped: {
    label: "En camino",
    icon: Truck,
    classes:
      "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/20",
  },
  entregado: {
    label: "Entregado",
    icon: CheckCircle2,
    classes:
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle2,
    classes:
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    classes:
      "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
  },
  canceled: {
    label: "Cancelado",
    icon: XCircle,
    classes:
      "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    classes:
      "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
  },
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const key = normalize(String(status)) as StatusKey
  const config =
    STATUS_MAP[key] ??
    ({
      label: String(status),
      icon: Package,
      classes:
        "bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-800/60 dark:text-stone-200 dark:ring-stone-700/60",
    } as const)

  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        "backdrop-blur",
        config.classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  )
}