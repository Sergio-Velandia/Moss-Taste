import { CircleAlert, LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '@/lib/clases'

interface PropsEstado {
  titulo: string
  children?: ReactNode
  /** Siguiente paso: un botón o enlace. Ninguna pantalla queda sin salida. */
  accion?: ReactNode
  icono?: LucideIcon
  /** Nivel del título según dónde se use el estado. */
  nivel?: 'h2' | 'h3'
  className?: string
}

// Estado vacío: qué es, por qué está vacío y cómo empezar.
export function EstadoVacio({ titulo, children, accion, icono: Icono, nivel: Titulo = 'h2', className }: PropsEstado) {
  return (
    <section
      className={cx(
        'grid justify-items-center gap-3 rounded-lg border border-dashed border-line-strong px-6 py-10 text-center',
        className,
      )}
    >
      {Icono && (
        <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <Icono aria-hidden="true" className="size-7" strokeWidth={1.75} />
        </span>
      )}
      <Titulo className="text-2xl">{titulo}</Titulo>
      {children && <div className="max-w-prose text-ink-soft">{children}</div>}
      {accion && <div className="mt-2">{accion}</div>}
    </section>
  )
}

// Estado de error: qué pasó y cómo arreglarlo, sin disculpas ni trazas técnicas.
export function EstadoError({ titulo, children, accion, nivel: Titulo = 'h2', className }: Omit<PropsEstado, 'icono'>) {
  return (
    <section role="alert" className={cx('grid justify-items-center gap-3 rounded-lg bg-danger-soft px-6 py-10 text-center', className)}>
      <span className="grid size-14 place-items-center rounded-full bg-surface text-danger">
        <CircleAlert aria-hidden="true" className="size-7" strokeWidth={1.75} />
      </span>
      <Titulo className="text-2xl text-ink">{titulo}</Titulo>
      {children && <div className="max-w-prose text-ink">{children}</div>}
      {accion && <div className="mt-2">{accion}</div>}
    </section>
  )
}

// Carga: el texto dice qué se está cargando y el lector de pantalla lo anuncia sin interrumpir.
export function Cargando({ texto = 'Cargando…', className }: { texto?: string; className?: string }) {
  return (
    <output className={cx('flex items-center justify-center gap-2.5 py-10 text-ink-soft', className)}>
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-accent" />
      <span>{texto}</span>
    </output>
  )
}
