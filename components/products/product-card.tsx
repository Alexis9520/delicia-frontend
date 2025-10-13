"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toast } = useToast()

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
      toast({
        title: "Agregado al carrito",
        description: `${product.name} ha sido agregado a tu carrito`,
      })
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-2xl bg-white/70 backdrop-blur-lg border border-yellow-100 rounded-2xl">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-yellow-200/30 via-white to-yellow-100">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105 drop-shadow-lg"
            sizes="(max-width: 600px) 100vw, 400px"
          />
          {!product.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-yellow-100/80">
              <span className="text-lg font-semibold text-yellow-900">No disponible</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-5">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-bold text-xl mb-1 line-clamp-1 hover:text-yellow-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-yellow-800/70 line-clamp-2 mb-2">{product.description}</p>
        <p className="text-3xl font-extrabold text-yellow-700 drop-shadow">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl transition-all focus:ring-2 focus:ring-yellow-300 active:scale-95"
          onClick={handleAddToCart}
          disabled={!product.available || product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}