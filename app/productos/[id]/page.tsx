"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import type { Product } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const response: Product = await api.get(`/products/${params.id}`)
      setProduct(response)
    } catch (error) {
      // Mock data for development
      setProduct({
        id: params.id as string,
        name: "Pan Francés",
        description:
          "Pan crujiente recién horneado con corteza dorada y miga suave. Perfecto para acompañar cualquier comida o disfrutar solo.",
        price: 2.5,
        category: "panes",
        image: "/french-bread.png",
        stock: 20,
        available: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem("cart", JSON.stringify(cart))

    toast({
      title: "Agregado al carrito",
      description: `${quantity} ${product.name} agregado(s) a tu carrito`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Producto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{product.stock} disponibles</p>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!product.available || product.stock === 0}
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </Button>

          {!product.available && (
            <p className="text-destructive text-center">Este producto no está disponible actualmente</p>
          )}
        </div>
      </div>
    </div>
  )
}
