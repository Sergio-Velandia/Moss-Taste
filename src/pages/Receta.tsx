import { ChefHat, ChevronLeft, Download } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { IlustracionCategoria } from '@/components/receta/IlustracionCategoria'
import { ListaIngredientes } from '@/components/receta/ListaIngredientes'
import { MetaReceta } from '@/components/receta/MetaReceta'
import { MiseEnPlace } from '@/components/receta/MiseEnPlace'
import { Pasos } from '@/components/receta/Pasos'
import { ResumenCosto } from '@/components/receta/ResumenCosto'
import { SelectorPorciones } from '@/components/receta/SelectorPorciones'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { calcularReceta } from '@/lib/calculo/costo'
import { formatoPorciones } from '@/lib/formato'
import { INGREDIENTES, recetaPorSlug } from '@/lib/recetas/catalogo'
import { consultaPorciones, leerPorciones, MAX_PORCIONES, MIN_PORCIONES } from '@/lib/recetas/porciones'
import type { Receta as TipoReceta } from '@/lib/recetas/tipos'
import { useMetadatos } from '@/lib/useMetadatos'
import { NoEncontrada } from './NoEncontrada'

export function Receta() {
  const { slug = '' } = useParams()
  const receta = recetaPorSlug(slug)
  // key: al pasar de una receta a otra, el estado (porciones, avisos) vuelve a empezar.
  return receta ? <FichaReceta key={receta.id} receta={receta} /> : <NoEncontrada />
}

// Modo lectura: todo a la vista para leer antes de cocinar o para imprimir.
function FichaReceta({ receta }: { receta: TipoReceta }) {
  useMetadatos({ titulo: receta.titulo, descripcion: receta.resumen, ruta: `/recetas/${receta.id}`, indexable: !receta.ejemplo })
  const [params, setParams] = useSearchParams()
  const porciones = leerPorciones(params, receta.porcionesBase)
  const [aviso, setAviso] = useState('')
  const calculo = calcularReceta(receta, porciones, INGREDIENTES)
  const consulta = consultaPorciones(porciones, receta.porcionesBase)

  // replace: cambiar porciones no llena el historial.
  const cambiarPorciones = (n: number) => setParams(n === receta.porcionesBase ? {} : { porciones: String(n) }, { replace: true })

  const enlaceCocinar = (
    <BotonEnlace to={`/recetas/${receta.id}/cocinar${consulta}`} tamano="lg" icono={<ChefHat aria-hidden="true" className="size-5" />}>
      Cocinar paso a paso
    </BotonEnlace>
  )

  return (
    <article className="grid gap-12">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div className="grid gap-5">
          <Link to="/recetas" className="inline-flex min-h-11 w-fit items-center gap-1 font-bold text-ink-soft hover:text-ink hover:underline print:hidden">
            <ChevronLeft aria-hidden="true" className="size-5" />
            Todas las recetas
          </Link>
          {receta.ejemplo && <AvisoEjemplo />}
          <h1 tabIndex={-1} className="text-4xl outline-none sm:text-[3.25rem] sm:leading-[1.04]">
            {receta.titulo}
          </h1>
          <p className="max-w-prose text-xl text-ink-soft">{receta.resumen}</p>
          <MetaReceta receta={receta} conPorciones={false} />
          <div className="flex flex-wrap gap-3 print:hidden">
            {enlaceCocinar}
            <Boton
              tamano="lg"
              variante="secundario"
              icono={<Download aria-hidden="true" className="size-5" />}
              onClick={() => setAviso('Exportar a Excel, CSV y JSON estará disponible pronto.')}
            >
              Exportar
            </Boton>
          </div>
          <AvisoEnVivo mensaje={aviso} />
        </div>
        <IlustracionCategoria categoria={receta.categoria} className="aspect-video rounded-xl sm:aspect-[4/3] print:hidden" />
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <section aria-labelledby="titulo-ingredientes" className="grid content-start gap-5">
          <h2 id="titulo-ingredientes" className="text-3xl">
            Ingredientes
          </h2>
          <div className="grid gap-2">
            <SelectorPorciones valor={porciones} onChange={cambiarPorciones} min={MIN_PORCIONES} max={MAX_PORCIONES} className="print:hidden" />
            {porciones === receta.porcionesBase ? (
              <p className="text-sm text-ink-soft">Cantidades y costo para {formatoPorciones(porciones)}, como la receta original.</p>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
                Cantidades y costo para {formatoPorciones(porciones)}. La receta original es para {formatoPorciones(receta.porcionesBase)}.
                <Boton variante="fantasma" className="min-h-11 px-2 text-sm print:hidden" onClick={() => cambiarPorciones(receta.porcionesBase)}>
                  Volver a {formatoPorciones(receta.porcionesBase)}
                </Boton>
              </p>
            )}
          </div>
          <ListaIngredientes lineas={calculo.lineas} />
          <ResumenCosto costo={calculo} porciones={porciones} ejemplo={receta.ejemplo} />
        </section>

        <div className="grid content-start gap-12">
          {receta.miseEnPlace.length > 0 && (
            <section aria-labelledby="titulo-mise" className="grid gap-5">
              <h2 id="titulo-mise" className="text-3xl">
                Antes de empezar
              </h2>
              <MiseEnPlace tareas={receta.miseEnPlace} />
            </section>
          )}
          <section aria-labelledby="titulo-pasos" className="grid gap-6">
            <h2 id="titulo-pasos" className="text-3xl">
              Preparación
            </h2>
            <Pasos pasos={receta.pasos} />
          </section>
          <div className="print:hidden">{enlaceCocinar}</div>
        </div>
      </div>
    </article>
  )
}
