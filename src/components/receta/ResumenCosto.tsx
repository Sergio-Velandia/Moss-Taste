import { formatoCOP, formatoFecha, formatoPorciones } from '@/lib/formato'
import type { CostoReceta } from '@/lib/recetas/costoProvisional'

interface Props {
  costo: CostoReceta
  porciones: number
  ejemplo?: boolean
}

// La «tirilla»: el único bloque con superficie propia en la ficha. Rango de ±10 % y fecha visible.
export function ResumenCosto({ costo, porciones, ejemplo }: Props) {
  return (
    <section aria-labelledby="titulo-costo" className="grid gap-1 rounded-md border-y-2 border-dashed border-line-strong bg-surface px-5 py-4">
      <h2 id="titulo-costo" className="font-body text-sm font-bold text-ink-soft">
        Costo estimado para {formatoPorciones(porciones)}
      </h2>
      <p className="text-3xl font-bold tabular-nums">
        {formatoCOP(costo.minimo)} a {formatoCOP(costo.maximo)}
      </p>
      <p className="tabular-nums">
        De {formatoCOP(costo.porPorcionMinimo)} a {formatoCOP(costo.porPorcionMaximo)} por porción
      </p>
      {costo.fechaPrecio && (
        <p className="text-sm text-ink-soft">
          Estimado al {formatoFecha(costo.fechaPrecio)}
          {ejemplo && ', con precios de ejemplo'}.
        </p>
      )}
      {costo.sinPrecio.length > 0 && (
        <p className="text-sm text-ink-soft">Sin precio, no suman al total: {costo.sinPrecio.join(', ')}.</p>
      )}
    </section>
  )
}
