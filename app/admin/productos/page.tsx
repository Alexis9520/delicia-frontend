"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductFormDialog } from "@/components/admin/product-form-dialog"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/products")
      setProducts(response)
    } catch (error) {
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
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["administrador"]}>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["administrador"]}>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Gestión de Productos</h1>
          <ProductFormDialog onSuccess={fetchProducts} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Productos ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell className="font-bold">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                        >
                          {product.stock} unidades
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.available ? "default" : "secondary"}>
                          {product.available ? "Disponible" : "No disponible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <ProductFormDialog
                            product={product}
                            onSuccess={fetchProducts}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}