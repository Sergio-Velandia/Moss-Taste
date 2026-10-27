import { Sun, SunDim } from 'lucide-react'
import { cx } from '@/lib/clases'
import type { PantallaEncendida } from './usePantallaEncendida'

interface Props {
  pantalla: PantallaEncendida
  /** Se llama al pulsar mientras la función está pendiente, para avisar. */
  onPendiente: () => void
  className?: string
}

// Tres estados: no disponible en este navegador, disponible (pendiente de la fase funcional) y activa.
export function BotonPantalla({ pantalla, onPendiente, className }: Props) {
  const { soportada, activa, pendiente } = pantalla
  const estado = !soportada ? 'No disponible en este navegador' : activa ? 'La pantalla no se apagará' : pendiente ? 'Llega en una próxima versión' : 'La pantalla puede apagarse'
  const Icono = activa ? Sun : SunDim

  return (
    <button
      type="button"
      aria-pressed={soportada ? activa : undefined}
      aria-disabled={!soportada || undefined}
      onClick={() => {
        if (!soportada) return
        if (pendiente) onPendiente()
        else pantalla.alternar()
      }}
      className={cx(
        'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-left',
        'transition-transform duration-150 active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:active:scale-100',
        activa ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface',
        className,
      )}
    >
      <span className={cx('grid size-10 shrink-0 place-items-center rounded-full', soportada ? 'bg-accent-soft text-accent' : 'bg-bg text-ink-soft')}>
        <Icono aria-hidden="true" className="size-5" />
      </span>
      <span className="grid">
        <span className={cx('font-bold', !soportada && 'text-ink-soft')}>Mantener pantalla encendida</span>
        <span className="text-sm text-ink-soft">{estado}</span>
      </span>
    </button>
  )
}
