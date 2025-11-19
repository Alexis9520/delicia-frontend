"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { get } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

type Movimiento = {
  id: number | string
  productoId: number | string
  cantidad: number
  tipo: string
  motivo: string
  referenciaTipo?: string | null
  referencia?: string | null
  createdAt: string | Date
  lote?: { id?: number; codigo?: string } | null
}

export default function LoteDetailPage() {
  const params = useParams() as { codigo?: string }
  const codigo = params?.codigo ?? ""
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetch = async () => {
    setIsLoading(true)
    try {
      // pageSize grande por defecto; la API acepta page y pageSize si deseas paginar aquí también
      const resp: any = await get(`/inventario/lotes/${encodeURIComponent(codigo)}/movimientos`, { page: 1, pageSize: 500 })

      // Soportar distintas formas de respuesta: { content: [...] }, { data: [...] }, array plano, o array anidado
      let data: any[] | null = null
      if (!resp) {
        data = null
      } else if (Array.isArray(resp)) {
        data = resp
      } else if (Array.isArray(resp.content)) {
        data = resp.content
      } else if (Array.isArray(resp.data)) {
        data = resp.data
      } else if (resp.content && Array.isArray(resp.content.content)) {
        data = resp.content.content
      } else {
        const maybeArray = Object.values(resp).find((v) => Array.isArray(v))
        data = maybeArray ?? null
      }

      setMovimientos(Array.isArray(data) ? data : [])
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cargar movimientos del lote", variant: "destructive" })
      setMovimientos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (codigo) fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo])

  const totalEntrada = movimientos.filter(m => m.tipo === "ENTRADA").reduce((s, m) => s + Math.abs(m.cantidad), 0)
  const totalSalida = movimientos.filter(m => m.tipo === "SALIDA").reduce((s, m) => s + Math.abs(m.cantidad), 0)

  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN","ROLE_TRABAJADOR"]}>
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lote: {codigo}</h1>
            <p className="text-sm text-muted-foreground">Movimientos relacionados con este lote</p>
          </div>
          
        </div>

        <div className="mb-4 flex gap-4">
          <Badge variant="secondary">Total ENTRADA: {totalEntrada}</Badge>
          <Badge variant="secondary">Total SALIDA: {totalSalida}</Badge>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="p-6 text-center"><Spinner /> Cargando...</div>
          ) : movimientos.length === 0 ? (
            <div className="p-6 text-center">No hay movimientos para este lote.</div>
          ) : (
            movimientos.map(m => (
              <div key={m.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Producto {m.productoId}</div>
                    <div className="text-sm text-muted-foreground">{m.motivo} • {new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{m.cantidad}</div>
                    <div className="text-xs">{m.tipo}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}