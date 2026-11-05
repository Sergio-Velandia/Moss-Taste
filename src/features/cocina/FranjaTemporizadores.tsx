import { Bell, BellOff, Check, Pause, Sun, SunDim, Timer } from 'lucide-react'
import { Boton } from '@/components/ui/Boton'
import { cx } from '@/lib/clases'
import { estaTerminado, formatoHace, formatoReloj, restante } from './temporizadores'
import type { Temporizadores } from './useTemporizadores'
import type { PantallaEncendida } from './usePantallaEncendida'

interface Props {
  temporizadores: Temporizadores
  pantalla: PantallaEncendida
  pasoActual: number
  irAlPaso: (paso: number) => void
}

const INTERRUPTOR = 'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-sm font-bold'

// Acompaña todos los pasos: las lentejas tienen 30 minutos corriendo en el paso 2 mientras se trabaja en el 3.
// Lo que termina se queda aquí hasta darle «Listo», aunque ya no suene.
export function FranjaTemporizadores({ temporizadores, pantalla, pasoActual, irAlPaso }: Props) {
  const { lista, terminados, ahora, silenciada, alternarSilencio, quitar } = temporizadores
  if (!lista.length) return null

  return (
    <section aria-label="Temporizadores de esta receta" className="border-t border-line bg-surface">
      {terminados.length > 0 && (
        <ul className="grid gap-px bg-line">
          {terminados.map((t) => (
            <li key={t.paso} className="bg-accent text-on-accent">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
                <p className="font-bold">
                  Terminó el paso {t.paso} <span className="font-normal">{formatoHace(ahora - (t.fin ?? ahora))}</span>
                </p>
                <Boton variante="secundario" onClick={() => quitar(t.paso)} aria-label={`Listo, paso ${t.paso}`} icono={<Check aria-hidden="true" className="size-5" />}>
                  Listo
                </Boton>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        {/* En el teléfono ocupa toda la fila: con flex-1 solo, se encoge a cero y queda debajo de los interruptores. */}
        <ul className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:flex-1">
          {lista
            .filter((t) => !estaTerminado(t, ahora))
            .map((t) => {
              const reloj = formatoReloj(restante(t, ahora))
              const enPausa = t.fin === null
              return (
                <li key={t.paso}>
                  <button
                    type="button"
                    onClick={() => irAlPaso(t.paso)}
                    aria-current={t.paso === pasoActual ? 'step' : undefined}
                    aria-label={`Ir al paso ${t.paso}: ${enPausa ? 'en pausa, ' : ''}faltan ${reloj}`}
                    className={cx(INTERRUPTOR, 'tabular-nums', t.paso === pasoActual ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg')}
                  >
                    {enPausa ? <Pause aria-hidden="true" className="size-4" /> : <Timer aria-hidden="true" className="size-4" />}
                    Paso {t.paso} · {reloj}
                  </button>
                </li>
              )
            })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={silenciada} aria-label="Silenciar alarma" onClick={alternarSilencio} className={cx(INTERRUPTOR, silenciada ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg')}>
            {silenciada ? <BellOff aria-hidden="true" className="size-4" /> : <Bell aria-hidden="true" className="size-4" />}
            {silenciada ? 'Silenciada' : 'Con sonido'}
          </button>
          {pantalla.soportada && (
            <button type="button" aria-pressed={pantalla.activa} aria-label="Mantener pantalla encendida" onClick={pantalla.alternar} className={cx(INTERRUPTOR, pantalla.activa ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg')}>
              {pantalla.activa ? <Sun aria-hidden="true" className="size-4" /> : <SunDim aria-hidden="true" className="size-4" />}
              {pantalla.activa ? 'Pantalla encendida' : 'Pantalla normal'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
