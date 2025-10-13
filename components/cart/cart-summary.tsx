"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Truck } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface CartSummaryProps {
  subtotal: number
  shipping?: number
  tax?: number
  total: number
  onCheckout?: () => void
  checkoutLabel?: string
  isCheckoutDisabled?: boolean
}

export function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  total,
  onCheckout,
  checkoutLabel = "Proceder al pago",
  isCheckoutDisabled = false,
}: CartSummaryProps) {
  const FREE_SHIPPING = 50
  const missing = Math.max(0, FREE_SHIPPING - subtotal)
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100))

  return (
    <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
          Resumen del Pedido
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-base">
        {/* Envío gratis progress */}
        <div className="rounded-xl border border-white/60 bg-white/70 p-3 dark:border-white/10 dark:bg-stone-900/60">
          {subtotal >= FREE_SHIPPING ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">¡Envío gratis aplicado!</p>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                <Truck className="h-4 w-4" />
                Agrega {formatCurrency(missing)} más para envío gratis
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-600 dark:text-stone-300">Subtotal</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-300">Envío</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(shipping)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-300">Impuestos</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(tax)}</span>
          </div>
        )}

        <Separator className="bg-stone-200 dark:bg-stone-800" />

        <div className="flex items-center justify-between text-xl font-extrabold">
          <span className="text-stone-900 dark:text-stone-100">Total</span>
          <span className="text-stone-900 drop-shadow dark:text-stone-100">{formatCurrency(total)}</span>
        </div>
      </CardContent>

      {onCheckout && (
        <CardFooter>
          <Button
            className="w-full rounded-xl"
            size="lg"
            variant="brand"
            onClick={onCheckout}
            disabled={isCheckoutDisabled}
          >
            {checkoutLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}