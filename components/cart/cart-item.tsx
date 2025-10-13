"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const decrease = () => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
  const increase = () => onUpdateQuantity(item.id, Math.min(item.quantity + 1, item.stock))

  return (
    <div className="group flex gap-4 rounded-xl border-b border-white/60 px-3 py-4 last:border-b-0 hover:bg-white/60 hover:shadow-sm dark:border-white/10 dark:hover:bg-stone-900/40 sm:px-4 sm:py-5">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 shadow-sm dark:bg-stone-800">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-stone-900 dark:text-stone-100">
              {item.name}
            </h3>
            <p className="line-clamp-1 text-sm text-stone-500 dark:text-stone-400">
              {item.description}
            </p>
            {item.stock <= 3 && item.quantity < item.stock && (
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                ¡Quedan pocas unidades!
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-right text-xl font-extrabold text-stone-800 dark:text-stone-100">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/40"
              onClick={() => onRemove(item.id)}
              aria-label={`Eliminar ${item.name} del carrito`}
            >
              <Trash2 className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-white/70 bg-white/70 text-stone-700 hover:bg-white/90 dark:border-white/10 dark:bg-stone-900/60 dark:text-stone-200"
              onClick={decrease}
              disabled={item.quantity <= 1}
              aria-label="Quitar uno"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-10 text-center text-base font-bold tabular-nums text-stone-800 dark:text-stone-100">
              {item.quantity}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-white/70 bg-white/70 text-stone-700 hover:bg-white/90 dark:border-white/10 dark:bg-stone-900/60 dark:text-stone-200"
              onClick={increase}
              disabled={item.quantity >= item.stock}
              aria-label="Agregar uno"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-stone-500 dark:text-stone-400">
            {formatCurrency(item.price)} c/u
          </p>
        </div>
      </div>
    </div>
  )
}