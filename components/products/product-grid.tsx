"use client"

import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { Spinner } from "@/components/ui/spinner"
import { PackageOpen } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  onAddToCart?: (product: Product) => void
}

export function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-10 w-10 text-amber-500" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <PackageOpen className="h-6 w-6" />
        </div>
        <p className="text-base font-medium text-stone-700 dark:text-stone-200">No se encontraron productos</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 dark:text-stone-400">
          Intenta ajustar la búsqueda o cambiar la categoría para ver más opciones.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.06 },
        },
      }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 14, scale: 0.98 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
          }}
        >
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </motion.div>
  )
}