"use client"

import { useEffect, useRef, useState } from "react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Pencil, Trash2, CheckCircle2, XCircle, ImageIcon, Upload, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export interface Product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  stock: number
  available: boolean
}

const emptyForm: Product = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  stock: 0,
  available: true,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState<Product>(emptyForm)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/products")
      const data = (response as any)?.data ?? response
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      // Mock de productos si falla el backend
      setProducts([
        {
          id: "1",
          name: "Pan Integral",
          description: "Pan saludable y delicioso.",
          price: 35,
          category: "Panadería",
          image: "",
          stock: 20,
          available: true,
        },
        {
          id: "2",
          name: "Donas Glaseadas",
          description: "Donas cubiertas de azúcar y glaseado.",
          price: 25,
          category: "Repostería",
          image: "",
          stock: 40,
          available: true,
        },
      ])
      toast({
        title: "Modo demostración",
        description: "No se pudo cargar desde el servidor. Mostrando productos de ejemplo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setForm((prev) => {
      // Convertir a número en campos numéricos
      if (name === "price" || name === "stock") {
        const num = value === "" ? 0 : Number(value)
        return { ...prev, [name]: isNaN(num) ? 0 : num }
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      } as Product
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
      setForm((prev) => ({ ...prev, image: "" }))
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditId(null)
    setImageFile(null)
    setIsEditing(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let data: FormData | Product
      const token = localStorage.getItem("authToken")
      // Normaliza payload
      const normalized: Product = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      }

      if (imageFile) {
        data = new FormData()
        data.append("name", normalized.name)
        data.append("description", normalized.description)
        data.append("price", String(normalized.price))
        data.append("category", normalized.category)
        data.append("stock", String(normalized.stock))
        data.append("available", String(normalized.available))
        data.append("imageFile", imageFile)
        if (normalized.image) data.append("image", normalized.image)
      } else {
        data = normalized
      }

      if (isEditing && editId) {
        await api.put(`/products/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
          },
        })
        toast({ title: "Producto actualizado", description: "Se actualizó el producto correctamente." })
      } else {
        await api.post("/products", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
          },
        })
        toast({ title: "Producto creado", description: "Se agregó el producto correctamente." })
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el producto.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price) || 0,
      category: product.category,
      image: product.image || "",
      stock: Number(product.stock) || 0,
      available: !!product.available,
    })
    setIsEditing(true)
    setEditId(product.id || null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return
    setIsSubmitting(true)
    const token = localStorage.getItem("authToken")
    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast({ title: "Producto eliminado", description: "Se eliminó el producto correctamente." })
      fetchProducts()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // KPIs
  const totalProductos = products.length
  const totalDisponibles = products.filter((p) => p.available).length
  const totalNoDisponibles = products.filter((p) => !p.available).length

  // Preview de imagen (archivo o URL)
  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : form.image || ""

  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100">
              Gestión de Productos
            </h1>
            <Button variant="outline" onClick={fetchProducts} className="rounded-xl" disabled={isLoading || isSubmitting}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refrescar
            </Button>
          </div>

          {/* KPIs */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalProductos}</div>
              </CardContent>
            </Card>
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{totalDisponibles}</div>
              </CardContent>
            </Card>
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">No Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rose-600">{totalNoDisponibles}</div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Nombre del producto"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input
                    type="text"
                    name="category"
                    required
                    value={form.category}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Categoría"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label>Descripción</Label>
                  <textarea
                    name="description"
                    required
                    value={form.description}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Descripción del producto"
                    className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    name="price"
                    required
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    name="stock"
                    required
                    min={0}
                    value={form.stock}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="0"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Disponible</Label>
                  <Select
                    value={form.available ? "true" : "false"}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, available: val === "true" }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Disponible
                        </span>
                      </SelectItem>
                      <SelectItem value="false">
                        <span className="inline-flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-rose-600" />
                          No disponible
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Imagen */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Subir Imagen</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="h-11"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                      <Upload className="mr-2 h-4 w-4" />
                      Elegir
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">O ingresa una URL abajo.</p>
                </div>

                <div className="space-y-2">
                  <Label>URL Imagen</Label>
                  <Input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    disabled={isSubmitting || !!imageFile}
                    placeholder="https://imagen.com/producto.jpg"
                    className="h-11"
                  />
                </div>

                {/* Preview */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-4 rounded-xl border border-white/60 bg-white/70 p-3 dark:border-white/10 dark:bg-stone-900/60">
                    <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg bg-stone-100 text-stone-400 dark:bg-stone-800">
                      {imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreview} alt="Vista previa" className="h-16 w-16 object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-300">
                      {imagePreview ? "Vista previa de la imagen seleccionada" : "Sin imagen seleccionada"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 flex flex-col gap-2 pt-2">
                  <Button type="submit" disabled={isSubmitting} variant="brand" className="w-full rounded-xl">
                    {isSubmitting ? (isEditing ? "Guardando..." : "Agregando...") : isEditing ? "Guardar cambios" : "Agregar producto"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Cancelar edición
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tabla de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Todos los Productos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : products.length === 0 ? (
                <p className="py-8 text-center text-stone-500 dark:text-stone-400">No hay productos.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="min-w-[320px]">Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin imagen</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="max-w-md text-sm">{p.description}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{formatCurrency(Number(p.price) || 0)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.stock > 0 ? "secondary" : "destructive"}>{p.stock}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.available ? "default" : "destructive"}>
                              {p.available ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                title="Editar"
                                onClick={() => handleEdit(p)}
                                disabled={isSubmitting}
                              >
                                <Pencil className="h-4 w-4 text-amber-600" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                title="Eliminar"
                                onClick={() => handleDelete(p.id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}