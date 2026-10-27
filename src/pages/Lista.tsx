import { BookOpen, Download, ShoppingBasket, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { EstadoVacio } from '@/components/ui/Estados'
import { cx } from '@/lib/clases'
import { formatoCantidad, formatoCOP } from '@/lib/formato'
import { INGREDIENTES, RECETAS } from '@/lib/recetas/catalogo'
import { sumarLista } from '@/lib/recetas/lista'

// Lista de ejemplo con dos recetas en sus porciones base. Agregar recetas desde la ficha llega en la Fase 4.
const EJEMPLO = ['arepas-de-queso', 'arroz-con-leche']

export function Lista() {
  const [ids, setIds] = useState(EJEMPLO)
  const [comprados, setComprados] = useState<ReadonlySet<string>>(new Set())
  const [aviso, setAviso] = useState('')
  const recetas = RECETAS.filter((r) => ids.includes(r.id))
  const items = sumarLista(recetas.map((receta) => ({ receta, porciones: receta.porcionesBase })), INGREDIENTES)
  const conPrecio = items.filter((i) => i.subtotal !== null)
  const total = conPrecio.reduce((s, i) => s + (i.subtotal ?? 0), 0)
  const pendientes = items.filter((i) => !comprados.has(i.clave)).length

  const alternarComprado = (clave: string) =>
    setComprados((actual) => {
      const nuevo = new Set(actual)
      if (nuevo.has(clave)) nuevo.delete(clave)
      else nuevo.add(clave)
      return nuevo
    })

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/lista" />

      {recetas.length === 0 ? (
        <EstadoVacio
          titulo="Tu lista está vacía"
          icono={ShoppingBasket}
          accion={
            <BotonEnlace to="/recetas" icono={<BookOpen aria-hidden="true" className="size-5" />}>
              Ver recetas
            </BotonEnlace>
          }
        >
          <p>Agrega recetas y aquí se suman sus ingredientes en una sola lista para ir al mercado.</p>
        </EstadoVacio>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <section aria-labelledby="titulo-en-lista" className="grid content-start gap-4">
            <AvisoEjemplo texto="Lista de ejemplo" />
            <h2 id="titulo-en-lista" className="text-2xl">
              Recetas en la lista
            </h2>
            <ul className="grid gap-2">
              {recetas.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface py-1 pr-1 pl-4">
                  <Link to={`/recetas/${r.id}`} className="min-w-0 truncate font-bold hover:underline">
                    {r.titulo}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Quitar ${r.titulo} de la lista`}
                    onClick={() => setIds((actual) => actual.filter((id) => id !== r.id))}
                    className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-accent-soft hover:text-ink"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-soft">Cantidades para comprar, con lo que se pierde al limpiar o pelar, para las porciones base de cada receta.</p>
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
                return (
                  <li key={item.clave} className="border-b border-line last:border-b-0">
                    <label className="grid min-h-14 cursor-pointer grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3">
                      <input type="checkbox" checked={comprado} onChange={() => alternarComprado(item.clave)} className="size-5 cursor-pointer accent-accent" />
                      <span className={cx('grid', comprado && 'text-ink-soft line-through')}>
                        <span className="font-bold">
                          {item.ingrediente?.nombre ?? item.idIngrediente}{' '}
                          <span className="font-normal tabular-nums">{formatoCantidad(item, item.ingrediente)}</span>
                        </span>
                        <span className="text-sm text-ink-soft">Para {item.recetas.join(' y ')}</span>
                      </span>
                      <span className="text-right text-sm text-ink-soft tabular-nums">{item.subtotal === null ? 'Sin precio' : formatoCOP(item.subtotal)}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <div className="grid gap-1 rounded-md border-y-2 border-dashed border-line-strong bg-surface px-5 py-4">
              <p className="text-sm font-bold text-ink-soft">Costo estimado de la lista</p>
              <p className="text-3xl font-bold tabular-nums">
                {formatoCOP(Math.round(total * 0.9))} a {formatoCOP(Math.round(total * 1.1))}
              </p>
              <p className="text-sm text-ink-soft">Con precios de ejemplo.</p>
            </div>
            <Boton
              variante="secundario"
              className="justify-self-start"
              icono={<Download aria-hidden="true" className="size-5" />}
              onClick={() => setAviso('Exportar la lista a Excel, CSV y JSON estará disponible pronto.')}
            >
              Exportar lista
            </Boton>
            <AvisoEnVivo mensaje={aviso} />
          </section>
        </div>
      )}
    </div>
  )
}
