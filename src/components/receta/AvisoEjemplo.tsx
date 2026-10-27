import { FlaskConical } from 'lucide-react'
import { cx } from '@/lib/clases'

// Marca visible para todo dato ficticio de la Fase 1.
export function AvisoEjemplo({ texto = 'Receta de ejemplo', className }: { texto?: string; className?: string }) {
  return (
    <span className={cx('inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-bold text-ink', className)}>
      <FlaskConical aria-hidden="true" className="size-4 text-accent" strokeWidth={2} />
      {texto}
    </span>
  )
}
