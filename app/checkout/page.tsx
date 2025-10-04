"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderReview } from "@/components/checkout/order-review"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { Address } from "@/lib/types"
import { Check } from "lucide-react"

type CheckoutStep = "address" | "payment" | "review"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getTotal, clearCart } = useCart()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address")
  const [address, setAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleAddressSubmit = (newAddress: Address) => {
    setAddress(newAddress)
    setCurrentStep("payment")
  }

  const handlePaymentSubmit = (method: string) => {
    setPaymentMethod(method)
    setCurrentStep("review")
  }

  const handleConfirmOrder = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const orderData = {
        items: cart,
        address,
        paymentMethod,
        total,
      }

      const response = await api.post("/orders", orderData)

      clearCart()
      toast({
        title: "Pedido confirmado",
        description: "Tu pedido ha sido procesado exitosamente",
      })

      router.push(`/cliente/pedidos/${response.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { id: "address", label: "Dirección", completed: currentStep !== "address" },
    { id: "payment", label: "Pago", completed: currentStep === "review" },
    { id: "review", label: "Revisar", completed: false },
  ]

  return (
    <ProtectedRoute allowedRoles={["cliente"]}>
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground"
                    }`}
                  >
                    {step.completed ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className="text-sm mt-2 font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div>
          {currentStep === "address" && (
            <AddressForm onSubmit={handleAddressSubmit} initialAddress={address || undefined} />
          )}

          {currentStep === "payment" && (
            <PaymentForm onSubmit={handlePaymentSubmit} onBack={() => setCurrentStep("address")} />
          )}

          {currentStep === "review" && address && (
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
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}