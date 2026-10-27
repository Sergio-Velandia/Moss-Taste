import type { LineaCalculada, MotivoSinPrecio } from '@/lib/calculo/costo'
import { formatoCantidad, formatoCOP } from '@/lib/formato'

const SIN_PRECIO: Record<MotivoSinPrecio, string> = {
  'sin-precio': 'Sin precio',
  'sin-conversion': 'Sin equivalencia',
  'sin-ingrediente': 'No está en el catálogo',
}

// Ingredientes como una carta: nombre, puntos guía, cantidad y precio alineados a la derecha.
// Si al limpiar o pelar se pierde algo (merma), dice cuánto hay que comprar.
export function ListaIngredientes({ lineas }: { lineas: LineaCalculada[] }) {
  return (
    <ul className="grid">
      {lineas.map(({ item, ingrediente, cantidad, compra, subtotal, motivo }) => {
        return (
          <li key={item.ingrediente} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-line py-3 last:border-b-0">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="font-bold">{ingrediente?.nombre ?? item.ingrediente}</span>
              <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-line-strong" />
            </div>
            <span className="text-right tabular-nums">{formatoCantidad({ cantidad, unidad: item.unidad }, ingrediente)}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
              {item.ajustarAlGusto && <span className="rounded-full bg-accent-soft px-2 py-0.5 font-bold text-ink">Al gusto</span>}
              {ingrediente && compra !== null && ingrediente.merma > 0 && (
                <span className="tabular-nums">
                  Compra {formatoCantidad({ cantidad: compra, unidad: ingrediente.unidadBase }, ingrediente)}
                </span>
              )}
              {item.nota && <span>{item.nota}</span>}
            </div>
            <span className="text-right text-sm text-ink-soft tabular-nums">{subtotal === null ? SIN_PRECIO[motivo ?? 'sin-precio'] : formatoCOP(subtotal)}</span>
          </li>
        )
      })}
    </ul>
  )
}
