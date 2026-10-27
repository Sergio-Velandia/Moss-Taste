import { formatoCantidad, formatoCOP } from '@/lib/formato'
import type { LineaCosto } from '@/lib/recetas/costoProvisional'

// Ingredientes como una carta: nombre, puntos guía, cantidad y precio alineados a la derecha.
export function ListaIngredientes({ lineas }: { lineas: LineaCosto[] }) {
  return (
    <ul className="grid">
      {lineas.map(({ item, ingrediente, subtotal }) => (
        <li key={item.ingrediente} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-line py-3 last:border-b-0">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="font-bold">{ingrediente?.nombre ?? item.ingrediente}</span>
            <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-line-strong" />
          </div>
          <span className="text-right tabular-nums">{formatoCantidad(item, ingrediente)}</span>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            {item.ajustarAlGusto && <span className="rounded-full bg-accent-soft px-2 py-0.5 font-bold text-ink">Al gusto</span>}
            {item.nota && <span>{item.nota}</span>}
          </div>
          <span className="text-right text-sm text-ink-soft tabular-nums">{subtotal === null ? 'Sin precio' : formatoCOP(subtotal)}</span>
        </li>
      ))}
    </ul>
  )
}
