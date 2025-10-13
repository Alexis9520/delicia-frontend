"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X, Salad } from "lucide-react"
import type { Category } from "@/lib/types"

interface ProductFiltersProps {
  categories: Category[]
  searchQuery: string
  selectedCategory: string
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
}

export function ProductFilters({
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) {
  const pills = useMemo(() => [{ id: "all", name: "Todas" }, ...categories.map((c) => ({ id: c.slug, name: c.name }))], [
    categories,
  ])

  return (
    <div className="flex flex-col gap-4">
      {/* Búsqueda */}
      <div className="flex w-full flex-1 items-center gap-3">
        <div className="relative w-full">
          <Label htmlFor="search" className="sr-only">
            Buscar productos
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            id="search"
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 rounded-xl pl-10 pr-10 placeholder:text-stone-400 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition-colors hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-stone-400 dark:hover:text-stone-200"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Select accesible en desktop para cambios rápidos */}
        <div className="hidden w-56 md:block">
          <Label htmlFor="category" className="sr-only">
            Categoría
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger id="category" className="h-11 rounded-xl">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pills de categorías (scrollable en móvil) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 md:pt-0">
        <div className="inline-flex items-center gap-2">
          <span className="mr-1 hidden items-center gap-1 text-sm text-stone-500 md:flex">
            <Salad className="h-4 w-4" />
            Categorías:
          </span>
          {pills.map((pill) => {
            const active = selectedCategory === pill.id
            return (
              <Button
                key={pill.id}
                type="button"
                variant={active ? "brand" : "outline"}
                className={`h-9 rounded-full px-4 ${
                  active
                    ? "from-amber-500 to-rose-400"
                    : "border-white/70 bg-white/70 dark:border-white/10 dark:bg-stone-900/50"
                }`}
                onClick={() => onCategoryChange(pill.id)}
              >
                {pill.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Select visible en móvil (oculto en md+) para accesibilidad adicional */}
      <div className="md:hidden">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}