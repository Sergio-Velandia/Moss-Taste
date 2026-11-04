import type { LineaCalculada, MotivoSinPrecio } from '@/lib/calculo/costo'
import { esConversionEstimada } from '@/lib/calculo/unidades'
import { alternativaDe } from '@/lib/recetas/alternativa'
import { formatoCantidad, formatoCOP, formatoFecha, formatoPorcentaje } from '@/lib/formato'

const SIN_PRECIO: Record<MotivoSinPrecio, string> = {
  'sin-precio': 'Sin precio',
  'sin-conversion': 'Sin equivalencia',
  'sin-ingrediente': 'Sin precio',
  'no-se-costea': 'No se costea',
}

const CHIP = 'rounded-full bg-accent-soft px-2 py-0.5 font-bold text-ink'

// Ingredientes como una carta: nombre, puntos guía, cantidad y precio alineados a la derecha.
// Lo estimado se dice en la fila: el peso de una medida (≈ 15 g) y la merma con que se calcula la compra.
// En las recetas personales, cada precio dice que viene del catálogo y de cuándo: quien escribió «papa criolla»
// a mano no puso ese número y tiene que saber de dónde salió.
export function ListaIngredientes({ lineas, origenDelPrecio = false }: { lineas: LineaCalculada[]; origenDelPrecio?: boolean }) {
  return (
    <ul className="grid">
      {lineas.map(({ item, ingrediente, cantidad, uso, compra, subtotal, motivo }) => (
        <li key={item.ingrediente} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-line py-3 last:border-b-0">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="font-bold">{ingrediente?.nombre ?? item.ingrediente}</span>
            <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-line-strong" />
          </div>
          <span className="text-right tabular-nums">{formatoCantidad({ cantidad, unidad: item.unidad }, ingrediente)}</span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
            {item.opcional && <span className={CHIP}>Opcional</span>}
            {item.ajustarAlGusto && <span className={CHIP}>Al gusto</span>}
            {alternativaDe(item, ingrediente) && <span>{alternativaDe(item, ingrediente)}</span>}
            {ingrediente && uso !== null && esConversionEstimada(item.unidad, ingrediente.unidadBase) && (
              <span className="tabular-nums">≈ {formatoCantidad({ cantidad: uso, unidad: ingrediente.unidadBase }, ingrediente)}</span>
            )}
            {ingrediente && compra !== null && ingrediente.merma > 0 && (
              <span className="tabular-nums">
                Compra aprox. {formatoCantidad({ cantidad: compra, unidad: ingrediente.unidadBase }, ingrediente)} (merma estimada del{' '}
                {formatoPorcentaje(ingrediente.merma)})
              </span>
            )}
            {item.nota && <span>{item.nota}</span>}
            {origenDelPrecio && subtotal !== null && ingrediente?.fechaPrecio && <span>Precio del catálogo, al {formatoFecha(ingrediente.fechaPrecio)}</span>}
          </div>
          <span className="text-right text-sm text-ink-soft tabular-nums">
            {subtotal === null ? SIN_PRECIO[motivo ?? 'sin-precio'] : formatoCOP(subtotal)}
            {item.opcional && subtotal !== null && <span className="block">opcional</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}
