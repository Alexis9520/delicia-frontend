"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-medium">${shipping.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impuestos</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </CardContent>
      {onCheckout && (
        <CardFooter>
          <Button className="w-full" size="lg" onClick={onCheckout} disabled={isCheckoutDisabled}>
            {checkoutLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
