"use client"

import { useState, useEffect } from "react"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { Pagination } from "@/components/products/pagination"
import { api } from "@/lib/api"
import type { Product, Category, PaginatedResponse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

// Mock categories - replace with API call
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
      // Mock data for development
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
    // Cart logic will be implemented in next task
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-balance">Nuestros Productos</h1>
        <p className="text-muted-foreground text-lg">Descubre nuestra selección de productos artesanales</p>
      </div>

      <ProductFilters
        categories={mockCategories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
      />

      <ProductGrid products={products} isLoading={isLoading} onAddToCart={handleAddToCart} />

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  )
}