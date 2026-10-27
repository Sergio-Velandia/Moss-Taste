import { Minus, Plus } from 'lucide-react'
import { cx } from '@/lib/clases'

interface Props {
  valor: number
  onChange: (valor: number) => void
  min?: number
  max?: number
  className?: string
}

const BOTON =
  'grid size-11 cursor-pointer place-items-center rounded-full bg-accent-soft text-ink transition-transform duration-150 active:scale-95 aria-disabled:cursor-not-allowed aria-disabled:opacity-45 aria-disabled:active:scale-100'

// Selector de porciones con botones grandes. El número se anuncia al cambiar.
export function SelectorPorciones({ valor, onChange, min = 1, max = 30, className }: Props) {
  const cambiar = (delta: number) => {
    const nuevo = Math.min(max, Math.max(min, valor + delta))
    if (nuevo !== valor) onChange(nuevo)
  }
  return (
    <fieldset className={cx('flex flex-wrap items-center gap-3', className)}>
      {/* La leyenda nativa no se deja alinear en fila; se oculta y se muestra un texto equivalente. */}
      <legend className="sr-only">Porciones</legend>
      <span aria-hidden="true" className="font-bold">
        Porciones
      </span>
      <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface p-1">
        <button type="button" aria-label="Quitar una porción" aria-disabled={valor <= min || undefined} onClick={() => cambiar(-1)} className={BOTON}>
          <Minus aria-hidden="true" className="size-5" />
        </button>
        <output aria-live="polite" className="min-w-12 text-center text-xl font-bold tabular-nums">
          {valor}
        </output>
        <button type="button" aria-label="Agregar una porción" aria-disabled={valor >= max || undefined} onClick={() => cambiar(1)} className={BOTON}>
          <Plus aria-hidden="true" className="size-5" />
        </button>
      </div>
    </fieldset>
  )
}
