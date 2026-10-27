import { ChefHat, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { MiseEnPlace } from '@/components/receta/MiseEnPlace'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { clasesBoton } from '@/components/ui/estilosBoton'
import { cx } from '@/lib/clases'
import { factorPorciones } from '@/lib/calculo/escalar'
import { formatoCantidad, formatoPorciones } from '@/lib/formato'
import { ingrediente } from '@/lib/recetas/catalogo'
import { consultaPorciones, leerPorciones } from '@/lib/recetas/porciones'
import type { IngredienteReceta, Receta } from '@/lib/recetas/tipos'
import { BotonPantalla } from './BotonPantalla'
import { Temporizador } from './Temporizador'
import { usePantallaEncendida } from './usePantallaEncendida'

// Pantallas: 0 = antes de empezar, 1..N = pasos, N+1 = final. La actual vive en la URL (?paso=3).

function ChipIngrediente({ item, factor }: { item: IngredienteReceta; factor: number }) {
  const ing = ingrediente(item.ingrediente)
  return (
    <li className="inline-flex items-baseline gap-2 rounded-full bg-accent-soft px-4 py-2 text-lg">
      <span className="font-bold">{ing?.nombre ?? item.ingrediente}</span>
      <span className="text-ink-soft tabular-nums">{formatoCantidad({ cantidad: item.cantidad * factor, unidad: item.unidad }, ing)}</span>
      {item.ajustarAlGusto && <span className="text-sm text-ink-soft">al gusto</span>}
    </li>
  )
}

const ENTRADA = { type: 'spring', stiffness: 420, damping: 38 } as const

export function ModoCocina({ receta }: { receta: Receta }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const pantalla = usePantallaEncendida()
  const [aviso, setAviso] = useState('')
  const total = receta.pasos.length
  const ultima = total + 1
  // Las porciones llegan desde la ficha (?porciones=8) y se conservan al avanzar y al salir.
  const porciones = leerPorciones(params, receta.porcionesBase)
  const factor = factorPorciones(receta.porcionesBase, porciones)
  const leido = Number(params.get('paso'))
  const actual = Number.isInteger(leido) && leido >= 0 && leido <= ultima ? leido : 0

  // Dirección del último movimiento: el contenido entra desde el lado hacia el que se avanza.
  const [direccion, setDireccion] = useState(1)
  const ir = useCallback(
    (destino: number) => {
      if (destino < 0 || destino > ultima || destino === actual) return
      setDireccion(destino > actual ? 1 : -1)
      setAviso('')
      const siguientes = new URLSearchParams(params)
      if (destino) siguientes.set('paso', String(destino))
      else siguientes.delete('paso')
      setParams(siguientes, { replace: true })
    },
    [actual, ultima, params, setParams],
  )
  const volver = `/recetas/${receta.id}${consultaPorciones(porciones, receta.porcionesBase)}`

  // Teclado: flechas y Av Pág / Re Pág avanzan o retroceden; Escape vuelve a la receta.
  useEffect(() => {
    function alTeclear(evento: KeyboardEvent) {
      if (evento.altKey || evento.ctrlKey || evento.metaKey) return
      if (evento.key === 'ArrowRight' || evento.key === 'PageDown') ir(actual + 1)
      else if (evento.key === 'ArrowLeft' || evento.key === 'PageUp') ir(actual - 1)
      else if (evento.key === 'Escape') navigate(volver)
      else return
      evento.preventDefault()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [actual, ir, navigate, volver])

  const paso = actual >= 1 && actual <= total ? receta.pasos[actual - 1] : undefined
  const etiqueta = actual === 0 ? 'Antes de empezar' : actual === ultima ? 'Receta terminada' : `Paso ${actual} de ${total}`
  const ingredientesPaso = paso?.ingredientes?.flatMap((id) => receta.ingredientes.filter((i) => i.ingrediente === id)) ?? []

  return (
    <main id="contenido" className="grid h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] bg-bg">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 sm:px-6">
          <Link to={volver} className={clasesBoton('secundario', 'md', 'shrink-0')} aria-keyshortcuts="Escape">
            <X aria-hidden="true" className="size-5" />
            Salir
          </Link>
          <h1 tabIndex={-1} className="min-w-0 flex-1 truncate text-xl outline-none">
            {receta.titulo}
          </h1>
          <output aria-live="polite" className="shrink-0 font-bold tabular-nums">
            {etiqueta}
          </output>
        </div>
        {/* Progreso: un segmento por paso; se llena con scaleX (solo transform). */}
        <div aria-hidden="true" className="mx-auto flex max-w-5xl gap-1 px-4 pb-3 sm:px-6">
          {receta.pasos.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className={cx(
                  'block h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out',
                  i < actual ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </span>
          ))}
        </div>
      </header>

      <div className="overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait" initial={false} custom={direccion}>
          <m.section
            key={actual}
            custom={direccion}
            variants={{
              entrar: (d: number) => ({ opacity: 0, x: d * 40 }),
              centro: { opacity: 1, x: 0, transition: ENTRADA },
              salir: (d: number) => ({ opacity: 0, x: d * -28, transition: { duration: 0.14, ease: 'easeIn' } }),
            }}
            initial="entrar"
            animate="centro"
            exit="salir"
            aria-label={etiqueta}
            className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:py-12"
          >
            {actual === 0 && (
              <>
                <div className="grid gap-3">
                  {receta.ejemplo && <AvisoEjemplo />}
                  <h2 className="text-3xl sm:text-4xl">Antes de empezar</h2>
                  <p className="max-w-prose text-lg text-ink-soft">
                    Deja esto listo y ten a la mano los ingredientes. Avanza con el botón «Siguiente» o con las flechas del teclado.
                  </p>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  {receta.miseEnPlace.length > 0 && (
                    <div className="grid content-start gap-4 text-lg">
                      <MiseEnPlace tareas={receta.miseEnPlace} />
                    </div>
                  )}
                  <div className="grid content-start gap-3">
                    <h3 className="font-body text-lg font-bold">Vas a necesitar, para {formatoPorciones(porciones)}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {receta.ingredientes.map((item) => (
                        <ChipIngrediente key={item.ingrediente} item={item} factor={factor} />
                      ))}
                    </ul>
                  </div>
                </div>
                <BotonPantalla pantalla={pantalla} onPendiente={() => setAviso('Mantener la pantalla encendida llega en una próxima versión.')} className="max-w-md" />
              </>
            )}

            {paso && (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
                <div className="grid content-start gap-4">
                  <span aria-hidden="true" className="font-display text-[clamp(4rem,3rem+5vw,6rem)] leading-none text-accent">
                    {actual}
                  </span>
                  <h2 className="sr-only">{etiqueta}</h2>
                  <p className="text-cocina max-w-[32ch]">{paso.texto}</p>
                </div>
                <div className="grid content-start gap-5">
                  {ingredientesPaso.length > 0 && (
                    <div className="grid gap-3">
                      <h3 className="font-body text-lg font-bold">Para este paso</h3>
                      <ul className="flex flex-wrap gap-2">
                        {ingredientesPaso.map((item) => (
                          <ChipIngrediente key={item.ingrediente} item={item} factor={factor} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {paso.temporizadorMin && (
                    <Temporizador minutos={paso.temporizadorMin} onIniciar={() => setAviso('Los temporizadores funcionarán en una próxima versión.')} />
                  )}
                </div>
              </div>
            )}

            {actual === ultima && (
              <div className="grid justify-items-start gap-5">
                <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
                  <ChefHat aria-hidden="true" className="size-8" strokeWidth={1.75} />
                </span>
                <h2 className="text-4xl">Buen provecho</h2>
                <p className="max-w-prose text-lg text-ink-soft">Terminaste {receta.titulo.toLocaleLowerCase('es')}. Puedes volver a la receta o buscar otra para la próxima.</p>
                <div className="flex flex-wrap gap-3">
                  <BotonEnlace to={volver} tamano="lg">
                    Volver a la receta
                  </BotonEnlace>
                  <BotonEnlace to="/recetas" tamano="lg" variante="secundario">
                    Ver más recetas
                  </BotonEnlace>
                </div>
              </div>
            )}
            <AvisoEnVivo mensaje={aviso} />
          </m.section>
        </AnimatePresence>
      </div>

      <nav aria-label="Pasos" className="border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => ir(actual - 1)}
            aria-disabled={actual === 0 || undefined}
            aria-keyshortcuts="ArrowLeft"
            className={clasesBoton('secundario', 'lg', 'min-h-16 w-full')}
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
            Anterior
          </button>
          {actual < ultima ? (
            <button type="button" onClick={() => ir(actual + 1)} aria-keyshortcuts="ArrowRight" className={clasesBoton('primario', 'lg', 'min-h-16 w-full')}>
              {actual === 0 ? 'Empezar' : actual === total ? 'Terminar' : 'Siguiente'}
              <ChevronRight aria-hidden="true" className="size-6" />
            </button>
          ) : (
            <BotonEnlace to={volver} tamano="lg" className="min-h-16 w-full">
              Salir
            </BotonEnlace>
          )}
        </div>
      </nav>
    </main>
  )
}
