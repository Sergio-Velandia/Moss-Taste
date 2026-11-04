import { BookOpen, ShoppingBasket, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { MenuExportar, type Formato } from '@/components/exportar/MenuExportar'
import { SelectorPorciones } from '@/components/receta/SelectorPorciones'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { EstadoVacio } from '@/components/ui/Estados'
import { RANGO_COSTO } from '@/lib/calculo/costo'
import { cx } from '@/lib/clases'
import { aCSV } from '@/lib/exportar/csv'
import { hoy } from '@/lib/exportar/descargar'
import { hojaDeLista, hojaDeRecetasDeLista } from '@/lib/exportar/hojas'
import { listaAJSON } from '@/lib/exportar/json'
import { formatoCantidad, formatoCOP } from '@/lib/formato'
import { useListaCompras } from '@/lib/lista/useListaCompras'
import { buscarReceta, useDatosCuenta } from '@/lib/cuentas/datos'
import { INGREDIENTES } from '@/lib/recetas/catalogo'
import { sumarLista, totalesLista, type EntradaLista } from '@/lib/recetas/lista'
import { MAX_PORCIONES, MIN_PORCIONES } from '@/lib/recetas/porciones'
import { rutaDeReceta } from '@/lib/recetas/rutaReceta'

export function Lista() {
  const lista = useListaCompras()
  const { avisoLista } = useDatosCuenta()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)
  const [aviso, setAviso] = useState('')

  // Las recetas guardadas que ya no existen en el recetario se ignoran.
  const entradas: EntradaLista[] = lista.estado.recetas.flatMap(({ id, porciones }) => {
    const receta = buscarReceta(id)
    return receta ? [{ receta, porciones }] : []
  })
  const items = sumarLista(entradas, INGREDIENTES)
  const totales = totalesLista(items)
  const comprados = new Set(lista.estado.comprados)
  const pendientes = items.filter((i) => !comprados.has(i.clave)).length
  const parcial = totales.sinPrecio.length > 0

  async function generar(formato: Formato) {
    const fecha = hoy()
    if (formato === 'json') return listaAJSON(entradas, items, fecha)
    if (formato === 'csv') return aCSV([hojaDeLista(items, fecha)])
    const { generarExcel } = await import('@/lib/exportar/excel')
    return generarExcel([hojaDeLista(items, fecha), hojaDeRecetasDeLista(entradas, INGREDIENTES)])
  }

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/lista">
        Junta varias recetas y te digo qué comprar, cómo viene en la tienda y cuánto vas a pagar. Agrégalas desde cada receta con «Agregar a la lista».
      </EncabezadoPagina>

      {!lista.persistente && (
        <p className="max-w-prose rounded-md bg-accent-soft px-4 py-3">
          {lista.enCuenta
            ? 'No se pudo guardar la lista en tu cuenta. Sigue aquí mientras no cierres la pestaña, y se intenta otra vez con el siguiente cambio.'
            : 'Este navegador no deja guardar la lista (por ejemplo, en una ventana privada). Funciona igual, pero se borra al cerrar la pestaña.'}
        </p>
      )}
      {avisoLista && <p className="max-w-prose rounded-md bg-accent-soft px-4 py-3">{avisoLista}</p>}

      {entradas.length === 0 ? (
        <EstadoVacio
          titulo="Tu lista está vacía"
          icono={ShoppingBasket}
          accion={
            <BotonEnlace to="/recetas" icono={<BookOpen aria-hidden="true" className="size-5" />}>
              Ver recetas
            </BotonEnlace>
          }
        >
          <p>En cada receta, elige las porciones y toca «Agregar a la lista». Aquí se suman los ingredientes para ir al mercado.</p>
        </EstadoVacio>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <section aria-labelledby="titulo-en-lista" className="grid content-start gap-4">
            <h2 id="titulo-en-lista" className="text-2xl">
              Recetas en la lista
            </h2>
            <ul className="grid gap-3">
              {entradas.map(({ receta, porciones }) => (
                <li key={receta.id} className="grid gap-2 rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link to={rutaDeReceta(receta.id)} className="min-w-0 font-bold hover:underline">
                      {receta.titulo}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Quitar ${receta.titulo} de la lista`}
                      onClick={() => lista.quitar(receta.id)}
                      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-accent-soft hover:text-ink"
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                  <SelectorPorciones valor={porciones} onChange={(n) => lista.cambiarPorciones(receta.id, n)} min={MIN_PORCIONES} max={MAX_PORCIONES} />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              {confirmarVaciar ? (
                <>
                  <span className="font-bold">¿Vaciar toda la lista?</span>
                  <Boton
                    variante="secundario"
                    onClick={() => {
                      lista.vaciar()
                      setConfirmarVaciar(false)
                      setAviso('Vaciaste la lista de compras.')
                    }}
                  >
                    Vaciar lista
                  </Boton>
                  <Boton variante="fantasma" onClick={() => setConfirmarVaciar(false)}>
                    Conservar
                  </Boton>
                </>
              ) : (
                <Boton variante="fantasma" onClick={() => setConfirmarVaciar(true)} icono={<Trash2 aria-hidden="true" className="size-5" />}>
                  Vaciar lista
                </Boton>
              )}
            </div>
          </section>

          <section aria-labelledby="titulo-compras" className="grid content-start gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-compras" className="text-2xl">
                Para comprar
              </h2>
              <output aria-live="polite" className="text-ink-soft">
                {pendientes === 0 ? 'Ya tienes todo' : `Faltan ${pendientes} de ${items.length}`}
              </output>
            </div>
            <ul className="grid">
              {items.map((item) => {
                const comprado = comprados.has(item.clave)
                const noSeCostea = item.ingrediente?.noSeCostea
                const enTienda = item.tienda?.descripcion ?? (noSeCostea ? 'De la casa' : item.ingrediente?.precio != null ? 'Suelto, por peso' : 'Sin datos de la tienda')
                return (
                  <li key={item.clave} className="border-b border-line last:border-b-0">
                    <label className="grid min-h-14 cursor-pointer grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3">
                      <input type="checkbox" checked={comprado} onChange={() => lista.alternarComprado(item.clave)} className="size-5 cursor-pointer accent-accent" />
                      <span className={cx('grid', comprado && 'text-ink-soft line-through')}>
                        <span className="font-bold">{item.ingrediente?.nombre ?? item.idIngrediente}</span>
                        <span className="text-sm tabular-nums">Necesitas {formatoCantidad(item, item.ingrediente)}</span>
                        <span className="text-sm text-ink-soft">En la tienda: {enTienda}</span>
                        <span className="text-sm text-ink-soft">Para {item.recetas.join(' y ')}</span>
                      </span>
                      <span className="text-right text-sm tabular-nums">
                        {noSeCostea ? (
                          <span className="text-ink-soft">No se costea</span>
                        ) : item.tienda?.costoCaja != null ? (
                          <>
                            <span className="block font-bold">{formatoCOP(item.tienda.costoCaja)}</span>
                            <span className="block text-ink-soft">en caja</span>
                          </>
                        ) : (
                          <span className="text-ink-soft">Sin precio</span>
                        )}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            {/* Dos números distintos, nunca mezclados: lo que cuestan las recetas y lo que se paga en caja. */}
            <div className="grid gap-3">
              <section aria-labelledby="titulo-cuestan" className="grid content-start gap-1 rounded-md border-y-2 border-dashed border-line-strong bg-surface px-5 py-4">
                <h3 id="titulo-cuestan" className="font-body text-sm font-bold text-ink-soft">
                  Lo que cuestan estas recetas{parcial && ' (parcial)'}
                </h3>
                <p className="text-2xl font-bold tabular-nums">
                  <span className="whitespace-nowrap">{formatoCOP(Math.round(totales.proporcional * (1 - RANGO_COSTO)))}</span> a{' '}
                  <span className="whitespace-nowrap">{formatoCOP(Math.round(totales.proporcional * (1 + RANGO_COSTO)))}</span>
                </p>
                <p className="text-sm text-ink-soft">Proporcional a lo que usas. Lo que sobra de cada empaque queda para otra vez.</p>
              </section>
              <section aria-labelledby="titulo-caja" className="grid content-start gap-1 rounded-md border-y-2 border-dashed border-accent bg-surface px-5 py-4">
                <h3 id="titulo-caja" className="font-body text-sm font-bold text-ink-soft">
                  Lo que pagas hoy en caja{parcial && ' (parcial)'}
                </h3>
                <p className="text-2xl font-bold tabular-nums">Aprox. {formatoCOP(totales.caja)}</p>
                <p className="text-sm text-ink-soft">Comprando los empaques completos, como cobra la registradora.</p>
              </section>
            </div>
            {parcial && <p className="font-bold">Totales parciales: falta el precio de {totales.sinPrecio.join(', ')}.</p>}
            <MenuExportar nombre={`lista-de-compras-${hoy()}`} generar={generar} tamano="md" />
          </section>
        </div>
      )}
      <AvisoEnVivo mensaje={aviso} />
    </div>
  )
}
