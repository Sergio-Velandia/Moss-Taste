import { formatoCOP, formatoFecha, formatoPorciones } from '@/lib/formato'
import type { CalculoReceta } from '@/lib/calculo/costo'

interface Props {
  costo: CalculoReceta
  porciones: number
  ejemplo?: boolean
}

// La «tirilla»: el único bloque con superficie propia en la ficha. Rango de ±10 % y fecha visible.
// Si ningún ingrediente tiene precio, no muestra «$ 0»: dice que el costo está pendiente.
export function ResumenCosto({ costo, porciones, ejemplo }: Props) {
  const sinNingunPrecio = costo.fechaPrecio === null && costo.sinPrecio.length > 0

  return (
    <section aria-labelledby="titulo-costo" className="grid gap-1 rounded-md border-y-2 border-dashed border-line-strong bg-surface px-5 py-4">
      <h2 id="titulo-costo" className="font-body text-sm font-bold text-ink-soft">
        Costo estimado para {formatoPorciones(porciones)}
      </h2>
      {sinNingunPrecio ? (
        <>
          <p className="text-2xl font-bold">Pendiente</p>
          <p>Todavía no hay precios para los ingredientes de esta receta. Las cantidades sí están calculadas.</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold tabular-nums">
            <span className="whitespace-nowrap">{formatoCOP(costo.minimo)}</span> a{' '}
            <span className="whitespace-nowrap">{formatoCOP(costo.maximo)}</span>
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
          {costo.opcionales.total > 0 && (
            <p className="text-sm text-ink-soft tabular-nums">
              Incluye {formatoCOP(costo.opcionales.total)} de opcionales ({costo.opcionales.nombres.join(', ').toLocaleLowerCase('es')}).
            </p>
          )}
          {costo.lineas.some((l) => l.compra !== null && (l.ingrediente?.merma ?? 0) > 0) && (
            <p className="text-sm text-ink-soft">Incluye lo que se pierde al pelar o limpiar, con una merma estimada.</p>
          )}
          {costo.sinPrecio.length > 0 && (
            <p className="text-sm text-ink-soft">Sin precio, no suman al total: {costo.sinPrecio.join(', ')}.</p>
          )}
        </>
      )}
    </section>
  )
}
