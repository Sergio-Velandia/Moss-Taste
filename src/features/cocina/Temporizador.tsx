import { Play, Timer } from 'lucide-react'
import { Boton } from '@/components/ui/Boton'

// Visual en la Fase 1. PENDIENTE (fase funcional): cuenta regresiva, pausa y aviso al terminar.
export function Temporizador({ minutos, onIniciar }: { minutos: number; onIniciar: () => void }) {
  const tiempo = `${String(minutos).padStart(2, '0')}:00`
  return (
    <section aria-label="Temporizador" className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-3">
        <Timer aria-hidden="true" className="size-7 text-accent" strokeWidth={1.75} />
        <div className="grid">
          <span className="text-4xl leading-none font-bold tabular-nums">{tiempo}</span>
          <span className="text-sm text-ink-soft">{minutos} minutos para este paso</span>
        </div>
      </div>
      <Boton variante="secundario" tamano="lg" onClick={onIniciar} icono={<Play aria-hidden="true" className="size-5" />}>
        Iniciar
      </Boton>
    </section>
  )
}
