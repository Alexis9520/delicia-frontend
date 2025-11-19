import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { API_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export function ComprobanteCard({ comprobante }: { comprobante: any }) {
  const { toast } = useToast()

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (id: string | number) => {
    setIsDownloading(true)
    try {
      const token = getAuthToken()
      const url = `${API_URL}/comprobantes/pdf/${id}`
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      // Do not expose token in URL or logs. Use credentials 'omit' when Authorization header is used,
      // otherwise rely on cookie-based auth with 'include'.
      const res = await fetch(url, { headers, credentials: token ? 'omit' : 'include' })

      if (res.status === 401 || res.status === 403) {
        toast({ title: 'No autorizado', description: 'No tienes permisos para descargar este comprobante (401/403).', variant: 'destructive' })
        return
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const short = text ? (text.length > 200 ? text.slice(0, 200) + '...' : text) : ''
        toast({ title: 'Error', description: `No se pudo descargar el PDF (${res.status}). ${short ? 'Detalle: ' + short : ''}`, variant: 'destructive' })
        return
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `comprobante-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      toast({ title: 'Error', description: String(err?.message || err), variant: 'destructive' })
    } finally {
      setIsDownloading(false)
    }
  }
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {comprobante.tipo?.toUpperCase() || "Comprobante"}
          </Badge>
          <span className="font-semibold text-amber-700 dark:text-amber-300">
            {comprobante.serie}-{comprobante.numero}
          </span>
        </div>
        <div>
          <span className="text-stone-700 dark:text-stone-200 font-medium">Cliente: </span>
          <span>
            {comprobante.clienteNombre}
            {comprobante.clienteDocumento ? ` (${comprobante.clienteDocumento})` : ""}
          </span>
        </div>
        <div>
          <span className="text-stone-700 dark:text-stone-200 font-medium">Fecha: </span>
          <span>
            {comprobante.fecha
              ? format(new Date(comprobante.fecha), "PPPp", { locale: es })
              : "-"}
          </span>
        </div>
        <div>
          <span className="text-stone-700 dark:text-stone-200 font-medium">Total: </span>
          <span>S/ {comprobante.total}</span>
        </div>
        {comprobante.mensaje && (
          <div className="text-emerald-700 dark:text-emerald-300 font-semibold">{comprobante.mensaje}</div>
        )}
        {comprobante.id && (
          <div>
            <Button
              type="button"
              onClick={() => handleDownload(comprobante.id)}
              disabled={isDownloading}
              variant="outline"
              size="sm"
              aria-label={`Descargar comprobante ${comprobante.serie}-${comprobante.numero}`}
            >
              {isDownloading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>Descargando...</span>
                </>
              ) : (
                <span>Descargar PDF</span>
              )}
            </Button>
          </div>
        )}
        {/* XML del comprobante ocultado por privacidad/UX */}
      </CardContent>
    </Card>
  )
}