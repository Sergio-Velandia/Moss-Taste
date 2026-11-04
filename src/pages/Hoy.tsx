import { Refrigerator, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { RecetasSinSaber } from '@/components/receta/RecetasSinSaber'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { Boton } from '@/components/ui/Boton'
import { Chip } from '@/components/ui/Chip'
import { EstadoVacio } from '@/components/ui/Estados'
import { GrupoChips } from '@/components/ui/GrupoChips'
import { useDatosCuenta } from '@/lib/cuentas/datos'
import { formatoCOP } from '@/lib/formato'
import { INGREDIENTES, RECETAS } from '@/lib/recetas/catalogo'
import { AYUDA_PRESUPUESTO, PRESUPUESTOS } from '@/lib/recetas/filtrar'
import { opcionesDeHoy, sugerirRecetas } from '@/lib/recetas/hoy'
import { esRecetaPersonal } from '@/lib/recetas/rutaReceta'

export function Hoy() {
  // Estado en la URL: ?tengo=leche&tengo=arroz&max=10000
  const [params, setParams] = useSearchParams()
  // Con sesión, también entran las recetas personales. Sin ella, esta lista está vacía y no se descarga nada.
  const { recetas: mias } = useDatosCuenta()
  const todas = [...RECETAS, ...mias]
  const opciones = opcionesDeHoy(todas, INGREDIENTES)
  // Un ?tengo= que no corresponde a ninguna opción se ignora.
  const validas = new Set([...opciones.catalogo.map((i) => i.id), ...opciones.libres])
  const tengo = [...new Set(params.getAll('tengo'))].filter((id) => validas.has(id))
  const max = Number(params.get('max')) || null
  const { sugerencias, sinSaber } = sugerirRecetas(todas, tengo, max, INGREDIENTES)

  const actualizar = (nuevoTengo: string[], nuevoMax: number | null) => {
    const p = new URLSearchParams()
    for (const id of nuevoTengo) p.append('tengo', id)
    if (nuevoMax) p.set('max', String(nuevoMax))
    setParams(p, { replace: true, preventScrollReset: true })
  }
  const alternar = (id: string) => actualizar(tengo.includes(id) ? tengo.filter((t) => t !== id) : [...tengo, id], max)

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/hoy">
        Marca los ingredientes que tienes en la cocina y, si quieres, cuánto quieres gastar por porción. Te muestro primero las recetas a las que menos les falta.
      </EncabezadoPagina>

      <div className="grid gap-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <GrupoChips titulo="Lo que tengo" ayuda="La sal, las especias y el agua se dan por hechas.">
          {opciones.catalogo.map((i) => (
            <Chip key={i.id} activo={tengo.includes(i.id)} onChange={() => alternar(i.id)}>
              {i.nombre}
            </Chip>
          ))}
        </GrupoChips>
        {opciones.libres.length > 0 && (
          <GrupoChips titulo="De tus recetas" ayuda="Los escribiste tú: no están en el catálogo y no tienen precio.">
            {opciones.libres.map((nombre) => (
              <Chip key={nombre} activo={tengo.includes(nombre)} onChange={() => alternar(nombre)}>
                {nombre}
              </Chip>
            ))}
          </GrupoChips>
        )}
        <GrupoChips titulo="Presupuesto por porción" ayuda={AYUDA_PRESUPUESTO}>
          {PRESUPUESTOS.map((p) => (
            <Chip key={p} activo={max === p} onChange={(activo) => actualizar(tengo, activo ? p : null)}>
              Hasta {formatoCOP(p)}
            </Chip>
          ))}
        </GrupoChips>
        {(tengo.length > 0 || max) && (
          <Boton variante="fantasma" className="justify-self-start" onClick={() => actualizar([], null)} icono={<X aria-hidden="true" className="size-5" />}>
            Empezar de nuevo
          </Boton>
        )}
      </div>

      <section aria-labelledby="titulo-sugerencias" className="grid gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-sugerencias" className="text-3xl">
            Puedes cocinar
          </h2>
          {todas.some((r) => r.ejemplo) && <AvisoEjemplo texto="Recetas y precios de ejemplo" />}
        </div>
        <output aria-live="polite" className="sr-only">
          {tengo.length || max ? `${sugerencias.length} ${sugerencias.length === 1 ? 'receta sugerida' : 'recetas sugeridas'}${sinSaber.length ? `, y ${sinSaber.length} sin saber si cabe${sinSaber.length === 1 ? '' : 'n'}` : ''}` : ''}
        </output>

        {tengo.length === 0 && !max ? (
          <EstadoVacio titulo="Marca lo que tienes" icono={Refrigerator} nivel="h3">
            <p>Elige al menos un ingrediente, o un presupuesto, y aquí aparecen las recetas que puedes preparar.</p>
          </EstadoVacio>
        ) : sugerencias.length === 0 ? (
          <EstadoVacio
            titulo="Ninguna receta encaja todavía"
            icono={Refrigerator}
            nivel="h3"
            accion={
              max ? (
                <Boton variante="secundario" onClick={() => actualizar(tengo, null)}>
                  Quitar el presupuesto
                </Boton>
              ) : undefined
            }
          >
            <p>{max ? 'Marca más ingredientes o sube el presupuesto por porción.' : 'Marca más ingredientes.'}</p>
          </EstadoVacio>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
            {sugerencias.map(({ receta, tienes, total, faltan }) => (
              <li key={receta.id} className="grid content-start gap-3">
                {(tengo.length > 0 || esRecetaPersonal(receta.id)) && (
                  <p className="font-bold">
                    {esRecetaPersonal(receta.id) && <span className="mr-2 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm text-ink">Tuya</span>}
                    {tengo.length > 0 && (faltan.length === 0 ? 'Tienes todo lo principal' : `Tienes ${tienes} de ${total}. Falta: ${faltan.join(', ')}.`)}
                  </p>
                )}
                <TarjetaReceta receta={receta} nivel="h3" />
              </li>
            ))}
          </ul>
        )}
        <RecetasSinSaber recetas={sinSaber} />
      </section>
    </div>
  )
}
