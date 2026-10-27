import { Timer } from 'lucide-react'
import { formatoMinutos } from '@/lib/formato'
import type { Paso } from '@/lib/recetas/tipos'

// Los pasos son una secuencia real: la numeración es información.
export function Pasos({ pasos }: { pasos: Paso[] }) {
  return (
    <ol className="grid gap-6">
      {pasos.map((paso, i) => (
        <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
          <span aria-hidden="true" className="font-display text-3xl leading-none text-accent tabular-nums">
            {i + 1}
          </span>
          <div className="grid gap-2">
            <p className="max-w-prose text-lg leading-relaxed">{paso.texto}</p>
            {paso.temporizadorMin && (
              <p className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-ink-soft">
                <Timer aria-hidden="true" className="size-4 text-accent" />
                {formatoMinutos(paso.temporizadorMin)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
