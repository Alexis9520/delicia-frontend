"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { Pagination } from "@/components/products/pagination"
import { api } from "@/lib/api"
import type { Product, Category, PaginatedResponse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

// Mock categories
const mockCategories: Category[] = [
  { id: "1", name: "Panes", slug: "panes" },
  { id: "2", name: "Pasteles", slug: "pasteles" },
  { id: "3", name: "Galletas", slug: "galletas" },
  { id: "4", name: "Tartas", slug: "tartas" },
]

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, currentPage])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "12",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
      })

      const response: PaginatedResponse<Product> = await api.get(`/products?${params.toString()}`)
      setProducts(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
      setProducts([
        {
          id: "1",
          name: "Pan Francés",
          description: "Pan crujiente recién horneado",
          price: 2.5,
          category: "panes",
          image: "/french-bread.png",
          stock: 20,
          available: true,
        },
        {
          id: "2",
          name: "Croissant",
          description: "Croissant de mantequilla artesanal",
          price: 3.0,
          category: "panes",
          image: "/golden-croissant.png",
          stock: 15,
          available: true,
        },
        {
          id: "3",
          name: "Pastel de Chocolate",
          description: "Delicioso pastel de chocolate con ganache",
          price: 25.0,
          category: "pasteles",
          image: "/decadent-chocolate-cake.png",
          stock: 5,
          available: true,
        },
        {
          id: "4",
          name: "Galletas de Avena",
          description: "Galletas caseras de avena y pasas",
          price: 8.0,
          category: "galletas",
          image: "/oatmeal-cookies.png",
          stock: 30,
          available: true,
        },
      ])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    // Opcional: disparar evento para animaciones del carrito
    window.dispatchEvent(new CustomEvent("cartUpdated"))
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
      {/* Hero compacto y pegajoso */}
      <div className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-stone-950/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-1 text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 sm:text-5xl"
          >
            Nuestro Catálogo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-center text-stone-600 dark:text-stone-300"
          >
            Descubre nuestra selección de productos artesanales, frescos y deliciosos
          </motion.p>

          {/* Barra de filtros dentro del header para foco visual */}
          <div className="mt-6 w-full">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60">
              <ProductFilters
                categories={mockCategories}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onSearchChange={(q) => {
                  setCurrentPage(1)
                  setSearchQuery(q)
                }}
                onCategoryChange={(c) => {
                  setCurrentPage(1)
                  setSelectedCategory(c)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </section>
    </main>
  )
}