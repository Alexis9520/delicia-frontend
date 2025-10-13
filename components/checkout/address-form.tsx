import type React from "react"
import { useState } from "react"
import { MapPin, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Address } from "@/lib/types"

interface AddressFormProps {
  initialAddress?: Address
  onSubmit: (address: Address) => void
  onBack?: () => void
}

export function AddressForm({ initialAddress, onSubmit, onBack }: AddressFormProps) {
  const [address, setAddress] = useState<Address>(
    initialAddress || {
      street: "",
      city: "Huancayo",
      state: "Junín",
      zipCode: "",
      country: "Perú",
      phone: "",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // País, ciudad y departamento SIEMPRE fijos
    onSubmit({
      ...address,
      city: "Huancayo",
      state: "Junín",
      country: "Perú",
    })
  }

  return (
    <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Dirección de Entrega</CardTitle>
        <CardDescription>Ingresa la dirección donde deseas recibir tu pedido</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Calle y Número</Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                id="street"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Av. Principal 123"
                required
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Código Postal</Label>
            <Input
              id="zipCode"
              value={address.zipCode}
              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
              placeholder="15000"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="+51 999 999 999"
                required
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Volver
              </Button>
            )}
            <Button type="submit" className="flex-1" variant="brand">
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}