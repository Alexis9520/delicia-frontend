"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, Banknote } from "lucide-react"

interface PaymentFormProps {
  onSubmit: (paymentMethod: string) => void
  onBack: () => void
}

export function PaymentForm({ onSubmit, onBack }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(paymentMethod)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pago</CardTitle>
        <CardDescription>Selecciona cómo deseas pagar tu pedido</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5" />
                <div>
                  <p className="font-medium">Tarjeta de Crédito/Débito</p>
                  <p className="text-sm text-muted-foreground">Paga con tu tarjeta</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                <Wallet className="h-5 w-5" />
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-muted-foreground">Paga con tu cuenta PayPal</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                <Banknote className="h-5 w-5" />
                <div>
                  <p className="font-medium">Efectivo</p>
                  <p className="text-sm text-muted-foreground">Paga al recibir tu pedido</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Volver
            </Button>
            <Button type="submit" className="flex-1">
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
