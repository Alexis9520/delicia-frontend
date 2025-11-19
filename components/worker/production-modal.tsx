"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { get, post, postProductionBatch } from "@/lib/api"
import { getAuthToken, getCurrentUserRole, isAdmin, isTrabajador } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  stock: number
  price?: number
}

interface Row {
  productoId: string
  cantidad: number | ""
  loteId?: string
}

interface Props {
  onClose: () => void
  onProcessed?: () => void
}

export default function ProductionModal({ onClose, onProcessed }: Props) {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [rows, setRows] = useState<Row[]>([{ productoId: "", cantidad: "", loteId: "" }])
  const [globalLote, setGlobalLote] = useState<string>("")
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        // Pedimos page=1 (1-based) y pageSize grande
        const resp: any = await get("/products", { page: 1, pageSize: 500 })

        // Soportar distintas formas de respuesta:
        // - resp.content -> paginado
        // - resp -> array plano
        // - resp.content.content -> doble nested (defensivo)
        let data: any[] | null = null
        if (!resp) {
          data = null
        } else if (Array.isArray(resp)) {
          data = resp
        } else if (Array.isArray(resp.content)) {
          data = resp.content
        } else if (resp.content && Array.isArray(resp.content.content)) {
          data = resp.content.content
        } else {
          // buscar primer array dentro del objeto
          const maybeArray = Object.values(resp).find(v => Array.isArray(v))
          data = maybeArray ?? null
        }

        if (!Array.isArray(data)) {
          setAvailableProducts([])
        } else {
          // Normalizar id a string para compatibilidad con Select value
          const normalized = data.map((p: any) => ({
            id: String(p.id ?? p.productoId ?? p._id ?? ""),
            name: p.name ?? p.nombre ?? p.title ?? "Producto",
            stock: Number(p.stock ?? p.cantidad ?? 0),
            price: p.price ?? undefined,
          }))
          setAvailableProducts(normalized)
        }
      } catch (err: any) {
        console.error("Error cargando productos:", err)
        setAvailableProducts([])
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos para producción.",
          variant: "destructive",
        })
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addRow = () => setRows((r) => [...r, { productoId: "", cantidad: "", loteId: "" }])
  const removeRow = (index: number) => setRows((r) => r.filter((_, i) => i !== index))
  const updateRow = (index: number, field: keyof Row, value: any) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    const items = rows
      .map((r) => ({
        productoId: Number(r.productoId),
        cantidad: Number(r.cantidad),
        loteId:
          (r.loteId && String(r.loteId).trim().length > 0)
            ? String(r.loteId).trim()
            : (globalLote && String(globalLote).trim().length > 0 ? String(globalLote).trim() : undefined),
      }))
      .filter((it) => Number.isFinite(it.productoId) && it.cantidad > 0)

    if (items.length === 0) {
      toast({ title: "Completa el lote", description: "Agrega al menos un producto con cantidad mayor a 0.", variant: "destructive" })
      return
    }

    // Verificar token antes de enviar
    const token = getAuthToken()
    if (!token) {
      toast({ title: "No autenticado", description: "Debes iniciar sesión para procesar lotes.", variant: "destructive" })
      return
    }

    // Verificar rol del usuario: sólo trabajadores o admins pueden procesar lotes
    const role = getCurrentUserRole()
    if (!isTrabajador() && !isAdmin()) {
      toast({ title: "Permisos insuficientes", description: `Tu rol (${role ?? "desconocido"}) no permite procesar lotes.`, variant: "destructive" })
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    try {
      // Usar helper postProductionBatch que envía { items }
      await postProductionBatch(items)
      toast({ title: "Lote procesado", description: "El stock se ha actualizado correctamente." })
      onProcessed?.()
      onClose()
    } catch (err: any) {
      console.error("Error procesando lote de producción:", err)
      const status = err?.status
      const payload = err?.payload
      const message = payload?.message || err?.message || "Error al procesar lote"
      if (status === 403) {
        const detail = payload ? ` Detalle: ${JSON.stringify(payload)}` : ""
        toast({ title: "Acceso denegado", description: `403 Forbidden: no tienes permisos para procesar lotes.${detail}`, variant: "destructive" })
      } else {
        const detail = payload ? ` Detalle: ${JSON.stringify(payload)}` : ""
        toast({ title: "Error", description: `${String(message)}${detail}`, variant: "destructive" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900">
        <h3 className="mb-4 text-lg font-bold">Registrar lote de producción</h3>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="ID de lote global (opcional) — aplica a todas las filas"
            value={globalLote}
            onChange={(e) => setGlobalLote(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="ghost" onClick={() => setGlobalLote("")}>Limpiar</Button>
        </div>

        {loadingProducts ? (
          <div className="py-8 text-center">Cargando productos...</div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <Select value={row.productoId} onValueChange={(v) => updateRow(idx, "productoId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={availableProducts.length === 0 ? "Sin productos disponibles" : "Selecciona producto"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.length === 0 ? (
                        <SelectItem value="">No hay productos</SelectItem>
                      ) : (
                        availableProducts.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} (stock: {p.stock})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    type="number"
                    min={0}
                    value={row.cantidad === "" ? "" : String(row.cantidad)}
                    onChange={(e) => updateRow(idx, "cantidad", e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Cantidad"
                    className="w-28"
                  />
                </div>

                <div>
                  <Input
                    placeholder="ID lote (opcional por fila)"
                    value={row.loteId || ""}
                    onChange={(e) => updateRow(idx, "loteId", e.target.value)}
                    className="w-36"
                  />
                </div>

                <div>
                  <Button type="button" variant="outline" onClick={() => removeRow(idx)} disabled={rows.length === 1}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={addRow}>
                Agregar fila
              </Button>
              <div className="flex-1" />
              <Button type="button" onClick={onClose} variant="outline">Cancelar</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Procesando..." : "Procesar Lote"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div> 
  )
}