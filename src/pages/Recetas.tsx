import { SearchX, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { Boton } from '@/components/ui/Boton'
import { Campo, CampoSelect } from '@/components/ui/Campo'
import { Chip } from '@/components/ui/Chip'
import { EstadoVacio } from '@/components/ui/Estados'
import { GrupoChips } from '@/components/ui/GrupoChips'
import { formatoCOP } from '@/lib/formato'
import { CATEGORIAS, INGREDIENTES, RECETAS } from '@/lib/recetas/catalogo'
import { escribirFiltros, filtrarRecetas, hayFiltros, leerFiltros, PRESUPUESTOS, type Filtros } from '@/lib/recetas/filtrar'

// Solo se ofrecen los ingredientes que aparecen en alguna receta.
const INGREDIENTES_USADOS = [...new Set(RECETAS.flatMap((r) => r.ingredientes.map((i) => i.ingrediente)))]
  .map((id) => INGREDIENTES.get(id))
  .filter((i) => i !== undefined)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export function Recetas() {
  const [params, setParams] = useSearchParams()
  const filtros = leerFiltros(params)
  const resultados = filtrarRecetas(RECETAS, filtros, INGREDIENTES)

  // replace: escribir en el buscador no llena el historial de entradas.
  const cambiar = (cambios: Partial<Filtros>) => setParams(escribirFiltros({ ...filtros, ...cambios }), { replace: true })
  const alternarCategoria = (id: string) =>
    cambiar({ categorias: filtros.categorias.includes(id) ? filtros.categorias.filter((c) => c !== id) : [...filtros.categorias, id] })
  const quitarFiltros = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/recetas" />

      <search className="grid gap-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Campo
            etiqueta="Buscar"
            type="search"
            value={filtros.q}
            onChange={(e) => cambiar({ q: e.target.value })}
            placeholder="Ajiaco, arepas, papa criolla…"
            autoComplete="off"
            enterKeyHint="search"
          />
          <CampoSelect etiqueta="Ingrediente" value={filtros.ingrediente ?? ''} onChange={(e) => cambiar({ ingrediente: e.target.value || null })}>
            <option value="">Cualquiera</option>
            {INGREDIENTES_USADOS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </CampoSelect>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <GrupoChips titulo="Categoría">
            {CATEGORIAS.map((c) => (
              <Chip key={c.id} activo={filtros.categorias.includes(c.id)} onChange={() => alternarCategoria(c.id)}>
                {c.nombre}
              </Chip>
            ))}
          </GrupoChips>
          <GrupoChips titulo="Presupuesto por porción">
            {PRESUPUESTOS.map((p) => (
              <Chip key={p} activo={filtros.maxPorcion === p} onChange={(activo) => cambiar({ maxPorcion: activo ? p : null })}>
                Hasta {formatoCOP(p)}
              </Chip>
            ))}
          </GrupoChips>
        </div>
      </search>

      <section aria-labelledby="titulo-resultados" className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-resultados" className="font-body text-lg font-bold">
            <output aria-live="polite">
              {resultados.length === 1 ? '1 receta' : `${resultados.length} recetas`}
            </output>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {RECETAS.some((r) => r.ejemplo) && <AvisoEjemplo texto="Recetas y precios de ejemplo" />}
            {hayFiltros(filtros) && (
              <Boton variante="fantasma" onClick={quitarFiltros} icono={<X aria-hidden="true" className="size-5" />}>
                Quitar filtros
              </Boton>
            )}
          </div>
        </div>

        {resultados.length ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
            {resultados.map((receta) => (
              <li key={receta.id} className="grid">
                <TarjetaReceta receta={receta} nivel="h3" />
              </li>
            ))}
          </ul>
        ) : (
          <EstadoVacio
            titulo="Ninguna receta coincide"
            icono={SearchX}
            nivel="h3"
            accion={
              <Boton variante="secundario" onClick={quitarFiltros}>
                Quitar filtros
              </Boton>
            }
          >
            <p>Prueba con menos filtros o con otra palabra. La búsqueda mira el nombre, el resumen y los ingredientes.</p>
          </EstadoVacio>
        )}
      </section>
    </div>
  )
}
