import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface ProductoSeleccionado extends Product {
  cantidad: number
}

interface VentaMostradorModalProps {
  onClose: () => void;
  onVentaRegistrada: () => void;
}

export default function VentaMostradorModal({ onClose, onVentaRegistrada }: VentaMostradorModalProps) {
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([])
  const [nombre, setNombre] = useState("")
  const [documento, setDocumento] = useState("")
  const [pago, setPago] = useState("Efectivo")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingProductos, setIsFetchingProductos] = useState(true)
  const { toast } = useToast()

  // Cargar productos desde la BD al abrir el modal
  useEffect(() => {
    const fetchProductos = async () => {
      setIsFetchingProductos(true)
      try {
        // Puedes cambiar el pageSize si tienes muchos productos
        const response = await api.get("/products?page=1&pageSize=100")
        const paginated = response as any
        const productos: Product[] = paginated.data || []
        setProductosSeleccionados(
          productos.map(p => ({
            ...p,
            cantidad: 0
          }))
        )
      } catch (err) {
        toast({ title: "Error", description: "No se pudo cargar la lista de productos", variant: "destructive" })
        setProductosSeleccionados([])
      } finally {
        setIsFetchingProductos(false)
      }
    }
    fetchProductos()
  }, [])

  const handleCantidad = (id: string, cantidad: number | string) => {
    setProductosSeleccionados(ps =>
      ps.map(p => p.id === id ? { ...p, cantidad: Math.max(0, Number(cantidad)) } : p)
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const items = productosSeleccionados.filter(p => p.cantidad > 0).map(p => ({
      productId: p.id,
      quantity: p.cantidad,
    }))
    if (items.length === 0) {
      toast({ title: "Selecciona productos", description: "Debes elegir al menos un producto", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      await api.post("/orders/mostrador", {
        items,
        nombreCliente: nombre.trim(),
        documentoCliente: documento.trim(),
        pago,
        canal: "mostrador",
        status: "entregado",
      })
      toast({ title: "Venta registrada", description: "La venta presencial fue registrada correctamente." })
      onVentaRegistrada()
      onClose()
    } catch (err) {
      toast({ title: "Error", description: "No se pudo registrar la venta", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-lg font-bold mb-4">Venta mostrador</h2>
        {isFetchingProductos ? (
          <div className="py-8 flex justify-center">Cargando productos...</div>
        ) : (
          <div className="space-y-2 mb-3">
            {productosSeleccionados.length === 0 ? (
              <div className="text-center text-stone-500">No hay productos para mostrar.</div>
            ) : (
              productosSeleccionados.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="flex-1">{p.name} (S/ {p.price})</span>
                  <Input
                    type="number"
                    min={0}
                    max={p.stock}
                    value={p.cantidad}
                    onChange={e => handleCantidad(p.id, e.target.value)}
                    className="w-[70px]"
                    disabled={isLoading}
                  />
                </div>
              ))
            )}
          </div>
        )}
        <Input placeholder="Nombre cliente (opcional)" value={nombre} onChange={e => setNombre(e.target.value)} disabled={isLoading} />
        <Input placeholder="DNI/RUC cliente (opcional)" value={documento} onChange={e => setDocumento(e.target.value)} maxLength={11} disabled={isLoading} className="mt-2" />
        <select value={pago} onChange={e => setPago(e.target.value)} className="w-full rounded-lg border mt-2 mb-4" disabled={isLoading}>
          <option value="Efectivo">Efectivo</option>
          <option value="Yape">Yape</option>
          <option value="Transferencia">Transferencia</option>
        </select>
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={isLoading || isFetchingProductos} variant="brand" className="flex-1">
            {isLoading ? "Registrando..." : "Registrar venta"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" className="flex-1" disabled={isLoading}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}