import { Check, Pause, Play, Plus, RotateCcw, Timer } from 'lucide-react'
import { useState } from 'react'
import { Boton } from '@/components/ui/Boton'
import { estaTerminado, formatoHace, formatoReloj, MINUTO_MS, restante, type Temporizador as Datos } from './temporizadores'

interface Props {
  minutos: number
  /** El temporizador de este paso, si ya se inició. */
  temporizador: Datos | undefined
  ahora: number
  onIniciar: () => void
  onPausar: () => void
  onReanudar: () => void
  onSumarMinuto: () => void
  onQuitar: () => void
}

const HORA = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })

// El temporizador de un paso. El reloj no se anuncia cada segundo: solo cuando termina (ver Franja).
export function Temporizador({ minutos, temporizador: t, ahora, onIniciar, onPausar, onReanudar, onSumarMinuto, onQuitar }: Props) {
  const [confirmar, setConfirmar] = useState(false)
  const terminado = t ? estaTerminado(t, ahora) : false
  const corriendo = Boolean(t && t.fin !== null && !terminado)
  const reloj = t ? formatoReloj(restante(t, ahora)) : formatoReloj(minutos * MINUTO_MS)
  const estado = !t
    ? `${minutos} minutos para este paso`
    : terminado
      ? `Terminó ${formatoHace(ahora - (t.fin ?? ahora))}`
      : t.fin === null
        ? 'En pausa'
        : `Termina a las ${HORA.format(t.fin)}`

  return (
    <section aria-label="Temporizador" className="grid gap-4 rounded-lg border border-line-strong bg-surface p-5">
      <div className="flex items-center gap-3">
        <Timer aria-hidden="true" className="size-7 shrink-0 text-accent" strokeWidth={1.75} />
        <div className="grid">
          <span role="timer" className="text-4xl leading-none font-bold tabular-nums">
            {reloj}
          </span>
          <span className="text-sm text-ink-soft">{estado}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {!t && (
          <Boton tamano="lg" onClick={onIniciar} icono={<Play aria-hidden="true" className="size-5" />}>
            Iniciar
          </Boton>
        )}
        {corriendo && (
          <Boton variante="secundario" onClick={onPausar} icono={<Pause aria-hidden="true" className="size-5" />}>
            Pausar
          </Boton>
        )}
        {t && t.fin === null && (
          <Boton onClick={onReanudar} icono={<Play aria-hidden="true" className="size-5" />}>
            Reanudar
          </Boton>
        )}
        {terminado && (
          <Boton onClick={onQuitar} icono={<Check aria-hidden="true" className="size-5" />}>
            Listo
          </Boton>
        )}
        {t && (
          <Boton variante="secundario" onClick={onSumarMinuto} icono={<Plus aria-hidden="true" className="size-5" />}>
            Un minuto más
          </Boton>
        )}
        {t && !terminado && !confirmar && (
          <Boton variante="fantasma" onClick={() => setConfirmar(true)} icono={<RotateCcw aria-hidden="true" className="size-5" />}>
            Reiniciar
          </Boton>
        )}
        {t && !terminado && confirmar && (
          // Con las manos en la cocina es fácil tocar de más: reiniciar perdería todo lo que lleva contado.
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold">¿Reiniciar?</span>
            <Boton
              variante="secundario"
              onClick={() => {
                setConfirmar(false)
                onQuitar()
              }}
            >
              Sí, reiniciar
            </Boton>
            <Boton variante="fantasma" onClick={() => setConfirmar(false)}>
              Conservar
            </Boton>
          </span>
        )}
      </div>
      {!terminado && <p className="text-sm text-ink-soft">Suena solo con esta pantalla abierta. Con el teléfono bloqueado no suena.</p>}
    </section>
  )
}
