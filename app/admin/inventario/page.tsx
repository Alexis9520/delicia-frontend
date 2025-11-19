"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { get } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Archive, ChevronLeft, ChevronRight, Search, RefreshCw, Copy } from "lucide-react"

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

export default function InventarioAuditPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [page, setPage] = useState(1) // 1-based
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [queryProducto, setQueryProducto] = useState<string>("")
  const { toast } = useToast()

  const fetchMovimientos = async (p = page, ps = pageSize) => {
    setIsLoading(true)
    const safePage = Math.max(1, Number.isFinite(p) ? p : 1)
    const safePageSize = Math.max(1, Number.isFinite(ps) ? ps : 25)
    try {
      const resp: any = await get("/inventario/movimientos", { page: safePage, pageSize: safePageSize, productoId: queryProducto || undefined })

      // Soportar diferentes formas de respuesta del API:
      // - { content: [...] , totalPages, page }
      // - { data: [...] }
      // - array plano [...]
      // - objeto con primer array en alguna propiedad
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
        // buscar primer array dentro del objeto
        const maybeArray = Object.values(resp).find((v) => Array.isArray(v))
        data = maybeArray ?? null
      }

      setMovimientos(Array.isArray(data) ? data : [])

      // Normalizar paginación: intentar varias propiedades posibles
      const totalPagesCandidate = resp?.totalPages ?? resp?.total_pages ?? resp?.total ?? null
      if (typeof totalPagesCandidate === "number") {
        setTotalPages(totalPagesCandidate)
      } else if (Array.isArray(data)) {
        // Si no hay totalPages, estimar a partir del totalElements o del length
        const totalElements = resp?.totalElements ?? resp?.totalElements ?? resp?.totalCount ?? null
        if (typeof totalElements === "number") {
          setTotalPages(Math.max(1, Math.ceil(Number(totalElements) / safePageSize)))
        } else {
          setTotalPages(Math.max(1, Math.ceil(data.length / safePageSize)))
        }
      } else {
        setTotalPages(0)
      }

      setPage(resp?.page ?? resp?.number ?? resp?.pageNumber ?? safePage)
    } catch (err: any) {
      toast({ title: "Error", description: "No se pudo cargar movimientos de inventario", variant: "destructive" })
      setMovimientos([])
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimientos(1, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async (text: string | number | null | undefined) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(String(text))
      toast({ title: "Copiado", description: "Referencia copiada al portapapeles" })
    } catch {
      toast({ title: "Error", description: "No se pudo copiar", variant: "destructive" })
    }
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TRABAJADOR"]}>
      <main className="p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Auditoría de Inventario
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Entradas y salidas de stock. Revisa movimientos y referencia de cada operación.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Filtrar por producto ID..."
                value={queryProducto}
                onChange={(e) => setQueryProducto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchMovimientos(1, pageSize)
                  }
                }}
                aria-label="Filtrar por producto"
              />
              <Button
                onClick={() => {
                  setPage(1)
                  fetchMovimientos(1, pageSize)
                }}
                variant="outline"
                className="hidden md:inline-flex"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setQueryProducto("")
                  fetchMovimientos(1, pageSize)
                }}
                variant="ghost"
                className="ml-auto"
                title="Limpiar filtros"
              >
                <RefreshCw />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white/60 shadow-sm dark:bg-stone-900/60 dark:border-stone-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] md:min-w-[840px] table-auto">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-1 py-1 text-left text-xs">Fecha</th>
                  <th className="px-1 py-1 text-left text-xs">Producto ID</th>
                  <th className="px-1 py-1 text-right text-xs">Cantidad</th>
                  <th className="px-1 py-1 text-left text-xs">Tipo</th>
                  <th className="hidden md:table-cell px-1 py-1 text-left text-xs">Motivo</th>
                  <th className="px-1 py-1 text-left text-xs">Referencia</th>
                  <th className="hidden lg:table-cell px-1 py-1 text-left text-xs">Movimiento ID</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-1 py-4 text-center text-xs">
                      <Spinner className="inline-block h-5 w-5" /> Cargando...
                    </td>
                  </tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-1 py-4 text-center text-xs">
                      No hay movimientos
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className="border-t hover:bg-stone-50 dark:hover:bg-stone-800">
                      <td className="px-1 py-1 w-44 text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="px-1 py-1 w-28 text-xs">
                        <Link href={`/productos/${m.productoId}`} className="font-medium hover:underline">
                          {m.productoId}
                        </Link>
                      </td>
                      <td className="px-1 py-1 text-right font-semibold text-xs">{m.cantidad}</td>
                      <td className="px-1 py-1 text-xs">
                        <span className="inline-flex items-center gap-1">
                          {m.tipo === "ENTRADA" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">ENTRADA</Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-700 text-[10px]">SALIDA</Badge>
                          )}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-1 py-1 text-xs">{m.motivo}</td>

                      <td className="px-1 py-1 text-xs max-w-[180px] truncate">
                        {m.referencia ? (
                          m.referenciaTipo === "PEDIDO" ? (
                            <Link href={`/trabajador/pedidos/${m.referencia}`} className="text-amber-700 hover:underline">
                              Pedido #{String(m.referencia).slice(0, 8)}
                            </Link>
                          ) : (
                            <Link href={`/admin/inventario/lotes/${m.referencia}`} className="text-amber-700 hover:underline">
                              {m.referenciaTipo ?? "LOTE"}: {String(m.referencia).slice(0, 12)}
                            </Link>
                          )
                        ) : m.lote?.codigo ? (
                          <Link href={`/admin/inventario/lotes/${m.lote.codigo}`} className="text-amber-700 hover:underline">
                            LOTE: {m.lote.codigo}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="hidden lg:table-cell px-1 py-1 text-xs">{m.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t p-4">
            <div className="text-sm text-muted-foreground">
              Página {page} de {Math.max(1, totalPages)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (page > 1) {
                    const np = Math.max(1, page - 1)
                    setPage(np)
                    fetchMovimientos(np, pageSize)
                  }
                }}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={() => {
                  if (page + 1 <= totalPages) {
                    const np = page + 1
                    setPage(np)
                    fetchMovimientos(np, pageSize)
                  }
                }}
                disabled={page + 1 > totalPages}
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}