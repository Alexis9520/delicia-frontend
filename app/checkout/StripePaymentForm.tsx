"use client"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export function StripePaymentForm({
  amount,
  onSuccess,
}: {
  amount: number
  onSuccess: (paymentIntentId: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError("")

    try {
      // 1) Obtener clientSecret de backend
      const res = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Stripe en centavos
      })
      if (!res.ok) {
        setError("No se pudo iniciar el pago. Intenta más tarde.")
        setLoading(false)
        return
      }
      const { clientSecret } = await res.json()

      // 2) Confirmar pago
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (result.error) {
        setError(result.error.message || "Error en el pago")
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess(result.paymentIntent.id)
      }
    } catch {
      setError("No se pudo conectar con el servidor de pagos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-xl rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Pago con tarjeta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
            <CardElement
              options={{
                style: {
                  base: {
                    color: "#1f2937",
                    fontSmoothing: "antialiased",
                    fontSize: "16px",
                    "::placeholder": { color: "#9CA3AF" },
                  },
                  invalid: { color: "#ef4444" },
                },
                hidePostalCode: true,
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-stone-900/60">
            <span className="text-stone-600 dark:text-stone-300">Total a pagar</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(amount)}</span>
          </div>

          <Button
            type="submit"
            variant="brand"
            className="w-full rounded-xl"
            disabled={loading || !stripe || !elements}
          >
            {loading ? "Procesando..." : "Pagar de forma segura"}
            <Lock className="ml-2 h-4 w-4" />
          </Button>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}