import { Info } from 'lucide-react'
import { cx } from '@/lib/clases'

// Mensaje de estado que el lector de pantalla anuncia sin interrumpir (por ejemplo, «Próximamente»).
// Siempre montado y vacío por defecto, para que el anuncio funcione la primera vez.
export function AvisoEnVivo({ mensaje, className }: { mensaje: string; className?: string }) {
  return (
    <output aria-live="polite" className={cx('block', className)}>
      {mensaje && (
        <span className="inline-flex items-start gap-2 rounded-md bg-accent-soft px-3 py-2 text-sm text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
          {mensaje}
        </span>
      )}
    </output>
  )
}
