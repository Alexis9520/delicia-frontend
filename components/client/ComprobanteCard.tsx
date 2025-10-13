import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { API_URL } from "@/lib/api"

export function ComprobanteCard({ comprobante }: { comprobante: any }) {
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
            <a
              href={`${API_URL}/comprobantes/pdf/${comprobante.id}`}
              target="_blank"
              rel="noopener"
              className="text-amber-700 underline text-sm"
            >
              Descargar PDF
            </a>
          </div>
        )}
        {comprobante.xml && (
          <details className="mt-2">
            <summary className="cursor-pointer text-stone-700 dark:text-stone-300 text-sm">Ver XML</summary>
            <pre className="bg-stone-100 dark:bg-stone-800 rounded p-2 text-xs whitespace-pre-wrap">{comprobante.xml}</pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}