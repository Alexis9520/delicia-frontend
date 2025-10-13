"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, ArrowLeft, Minus, Plus, ShieldCheck, PackageOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { Product } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/products/${id}`)
      const data = (response as any)?.data ?? response
      setProduct(data as Product)
    } catch (error) {
      // Mock de desarrollo
      setProduct({
        id: String(id),
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

  const maxQty = useMemo(() => Math.max(0, product?.stock ?? 0), [product?.stock])

  const handleAddToCart = () => {
    if (!product) return
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existing = cart.find((item: any) => item.id === product.id)

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock)
      } else {
        cart.push({ ...product, quantity: Math.min(quantity, product.stock) })
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      // Notifica a listeners (navbar badge, etc.)
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { id: product.id, quantity } }))

      toast({
        title: "Agregado al carrito",
        description: `${quantity} × ${product.name} agregado(s) a tu carrito`,
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar al carrito. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <main className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <Spinner className="h-8 w-8 text-amber-500" />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 px-4">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/60 bg-white/80 p-10 text-center shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <PackageOpen className="h-7 w-7" />
          </div>
          <p className="text-stone-600 dark:text-stone-300">Producto no encontrado</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => router.push("/catalogo")}>
            Volver al catálogo
          </Button>
        </div>
      </main>
    )
  }

  const outOfStock = !product.available || product.stock === 0

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-stone-700 hover:bg-white/70 dark:text-stone-200 dark:hover:bg-stone-900/60"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {/* Imagen */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Sello de garantía / fresco */}
            <div className="pointer-events-none absolute -left-2 -top-2 hidden rotate-[-8deg] md:block">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                <ShieldCheck className="h-3.5 w-3.5" />
                Fresco del día
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="mb-2 text-balance text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                {product.name}
              </h1>
              <p className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">
                {formatCurrency(product.price)}
              </p>
            </div>

            <Card className="rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
              <CardContent className="px-6 pb-6 pt-6">
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">{product.description}</p>
              </CardContent>
            </Card>

            {/* Cantidad */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 p-1 shadow backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[3ch] text-center text-base font-semibold tabular-nums">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300">{product.stock} disponibles</p>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={outOfStock}
              variant="brand"
              className="w-full rounded-xl"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {outOfStock ? "Sin stock" : "Agregar al carrito"}
            </Button>

            {!product.available && (
              <p className="text-center text-sm font-medium text-rose-600 dark:text-rose-400">
                Este producto no está disponible actualmente
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}