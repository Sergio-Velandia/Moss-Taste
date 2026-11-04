import { ChefHat, ChevronLeft, ShoppingBasket } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MenuExportar, type Formato } from '@/components/exportar/MenuExportar'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { calcularReceta } from '@/lib/calculo/costo'
import { aCSV } from '@/lib/exportar/csv'
import { hoy } from '@/lib/exportar/descargar'
import { hojasDeReceta } from '@/lib/exportar/hojas'
import { recetaAJSON } from '@/lib/exportar/json'
import { formatoPorciones } from '@/lib/formato'
import { useListaCompras } from '@/lib/lista/useListaCompras'
import { categoria, INGREDIENTES } from '@/lib/recetas/catalogo'
import { consultaPorciones, leerPorciones, MAX_PORCIONES, MIN_PORCIONES } from '@/lib/recetas/porciones'
import { esRecetaPersonal, rutaDeReceta } from '@/lib/recetas/rutaReceta'
import type { Receta } from '@/lib/recetas/tipos'
import { useMetadatos } from '@/lib/useMetadatos'
import { AvisoEjemplo } from './AvisoEjemplo'
import { ImagenReceta } from './ImagenReceta'
import { ListaIngredientes } from './ListaIngredientes'
import { MetaReceta } from './MetaReceta'
import { MiseEnPlace } from './MiseEnPlace'
import { Pasos } from './Pasos'
import { ResumenCosto } from './ResumenCosto'
import { SelectorPorciones } from './SelectorPorciones'

interface Props {
  receta: Receta
  /** A dónde vuelve el enlace de arriba. */
  volver: { a: string; texto: string }
  /** Lo propio de cada tipo de receta, bajo los botones: favoritos y notas, o editar y borrar. */
  extra?: ReactNode
}

// Modo lectura: todo a la vista para leer antes de cocinar o para imprimir. Lo comparten las recetas públicas y las personales.
export function FichaReceta({ receta, volver, extra }: Props) {
  const ruta = rutaDeReceta(receta.id)
  useMetadatos({ titulo: receta.titulo, descripcion: receta.resumen || 'Receta personal, guardada en tu cuenta.', ruta, indexable: !receta.ejemplo && ruta.startsWith('/recetas') })
  const [params, setParams] = useSearchParams()
  const porciones = leerPorciones(params, receta.porcionesBase)
  const [aviso, setAviso] = useState('')
  const [agregada, setAgregada] = useState(false)
  const lista = useListaCompras()
  const calculo = calcularReceta(receta, porciones, INGREDIENTES)
  const consulta = consultaPorciones(porciones, receta.porcionesBase)

  // replace: cambiar porciones no llena el historial.
  const cambiarPorciones = (n: number) => setParams(n === receta.porcionesBase ? {} : { porciones: String(n) }, { replace: true })

  function agregarALista() {
    const resultado = lista.agregar(receta.id, porciones)
    setAgregada(resultado !== 'llena')
    setAviso(
      resultado === 'agregada'
        ? `Agregaste la receta a la lista de compras, para ${formatoPorciones(porciones)}.`
        : resultado === 'actualizada'
          ? `La receta ya estaba en la lista: ahora es para ${formatoPorciones(porciones)}.`
          : 'La lista admite hasta 20 recetas. Quita alguna para agregar esta.',
    )
  }

  // Exporta con las porciones elegidas. El CSV es una sola tabla: ingredientes y total.
  async function generar(formato: Formato) {
    const fecha = hoy()
    if (formato === 'json') return recetaAJSON(receta, porciones, INGREDIENTES, fecha)
    const hojas = hojasDeReceta(receta, porciones, INGREDIENTES, categoria(receta.categoria)?.nombre ?? receta.categoria, fecha)
    if (formato === 'csv') return aCSV(hojas.slice(1, 3))
    const { generarExcel } = await import('@/lib/exportar/excel')
    return generarExcel(hojas)
  }

  const enlaceCocinar = (
    <BotonEnlace to={`${ruta}/cocinar${consulta}`} tamano="lg" icono={<ChefHat aria-hidden="true" className="size-5" />}>
      Cocinar paso a paso
    </BotonEnlace>
  )

  return (
    <article className="grid gap-12">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div className="grid gap-5">
          <Link to={volver.a} className="inline-flex min-h-11 w-fit items-center gap-1 font-bold text-ink-soft hover:text-ink hover:underline print:hidden">
            <ChevronLeft aria-hidden="true" className="size-5" />
            {volver.texto}
          </Link>
          {receta.ejemplo && <AvisoEjemplo />}
          <h1 tabIndex={-1} className="text-4xl outline-none sm:text-[3.25rem] sm:leading-[1.04]">
            {receta.titulo}
          </h1>
          {receta.resumen && <p className="max-w-prose text-xl text-ink-soft">{receta.resumen}</p>}
          <MetaReceta receta={receta} conPorciones={false} />
          <div className="flex flex-wrap items-start gap-3 print:hidden">
            {enlaceCocinar}
            <Boton tamano="lg" variante="secundario" onClick={agregarALista} icono={<ShoppingBasket aria-hidden="true" className="size-5" />}>
              Agregar a la lista
            </Boton>
            <MenuExportar nombre={`${receta.id}-${porciones}-porciones`} generar={generar} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 print:hidden">
            <AvisoEnVivo mensaje={aviso} />
            {agregada && (
              <BotonEnlace to="/lista" variante="fantasma">
                Ver la lista
              </BotonEnlace>
            )}
          </div>
          {extra && <div className="print:hidden">{extra}</div>}
        </div>
        <ImagenReceta receta={receta} variante="portada" className="print:hidden" />
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
          <ListaIngredientes lineas={calculo.lineas} origenDelPrecio={esRecetaPersonal(receta.id)} />
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
          {receta.notas && receta.notas.length > 0 && (
            <section aria-labelledby="titulo-notas" className="grid gap-4 border-l-2 border-accent pl-5">
              <h2 id="titulo-notas" className="text-2xl">
                Notas de la casa
              </h2>
              <ul className="grid gap-3 text-lg">
                {receta.notas.map((nota) => (
                  <li key={nota} className="max-w-prose">
                    {nota}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="print:hidden">{enlaceCocinar}</div>
        </div>
      </div>
    </article>
  )
}
