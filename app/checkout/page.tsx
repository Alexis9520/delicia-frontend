"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AddressForm } from "@/components/checkout/address-form"
import { OrderReview } from "@/components/checkout/order-review"
import { StripePaymentForm } from "./StripePaymentForm";
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { Address } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

const stripePromise = loadStripe(
  "pk_test_51SEz0UPyI7BFR7L8DE7OfFxAYInW4OE0H7E8Y8dsisIvigKJOZarb4MCniYpHWblTDxaHotoXZkcWEFOAWyE8wOk001hKGNhPu",
)

type CheckoutStep = "address" | "payment" | "review"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getTotal, clearCart } = useCart()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address")
  const [address, setAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleAddressSubmit = (newAddress: Address) => {
    setAddress(newAddress)
    setCurrentStep("payment")
  }

  const handleStripeSuccess = (intentId: string) => {
    setPaymentMethod("stripe")
    setPaymentIntentId(intentId)
    setCurrentStep("review")
  }

  const handleConfirmOrder = async () => {
    if (!address || !paymentIntentId) return

    setIsLoading(true)
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        address,
        paymentMethod,
        total,
        paymentIntentId,
      }

      const response = await api.post("/orders", orderData)

      clearCart()
      toast({
        title: "Pedido confirmado",
        description: "Tu pedido ha sido procesado exitosamente",
      })

      router.push(`/cliente/pedidos/${response.id}`)
    } catch {
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps: Array<{ id: CheckoutStep; label: string; completed: boolean }> = [
    { id: "address", label: "Dirección", completed: currentStep !== "address" },
    { id: "payment", label: "Pago", completed: currentStep === "review" },
    { id: "review", label: "Revisar", completed: false },
  ]

  return (
    <ProtectedRoute allowedRoles={["ROLE_CLIENTE"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 sm:text-5xl"
          >
            Finalizar Compra
          </motion.h1>

          {/* Steps */}
          <div className="mb-8 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id
                return (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={[
                          "grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold",
                          step.completed
                            ? "border-transparent bg-gradient-to-br from-amber-500 to-rose-400 text-white"
                            : isActive
                            ? "border-amber-500 text-amber-700 dark:text-amber-300"
                            : "border-stone-300 text-stone-400 dark:border-stone-700",
                        ].join(" ")}
                      >
                        {step.completed ? <Check className="h-5 w-5" /> : index + 1}
                      </div>
                      <span
                        className={[
                          "mt-2 text-xs font-medium",
                          isActive ? "text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400",
                        ].join(" ")}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={[
                          "mx-3 h-0.5 flex-1 rounded-full",
                          step.completed ? "bg-gradient-to-r from-amber-400 to-rose-400" : "bg-stone-200 dark:bg-stone-800",
                        ].join(" ")}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-right text-sm text-stone-600 dark:text-stone-300">
              Total: <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-6">
            {currentStep === "address" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <AddressForm onSubmit={handleAddressSubmit} initialAddress={address || undefined} />
              </motion.div>
            )}

            {currentStep === "payment" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Elements stripe={stripePromise} options={{ locale: "es" }}>
                  <StripePaymentForm amount={total} onSuccess={handleStripeSuccess} />
                </Elements>
              </motion.div>
            )}

            {currentStep === "review" && address && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <OrderReview
                  items={cart}
                  address={address}
                  paymentMethod={paymentMethod}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  onConfirm={handleConfirmOrder}
                  onBack={() => setCurrentStep("payment")}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}