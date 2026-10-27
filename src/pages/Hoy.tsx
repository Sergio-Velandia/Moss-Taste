import { Refrigerator, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { Boton } from '@/components/ui/Boton'
import { Chip } from '@/components/ui/Chip'
import { EstadoVacio } from '@/components/ui/Estados'
import { GrupoChips } from '@/components/ui/GrupoChips'
import { formatoCOP } from '@/lib/formato'
import { INGREDIENTES, RECETAS } from '@/lib/recetas/catalogo'
import { PRESUPUESTOS } from '@/lib/recetas/filtrar'
import { sugerirRecetas } from '@/lib/recetas/hoy'

// Solo los ingredientes principales: la sal y las especias se dan por hechas.
const OPCIONES = [...new Set(RECETAS.flatMap((r) => r.ingredientes.filter((i) => !i.ajustarAlGusto).map((i) => i.ingrediente)))]
  .map((id) => INGREDIENTES.get(id))
  .filter((i) => i !== undefined)
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export function Hoy() {
  // Estado en la URL: ?tengo=leche&tengo=arroz&max=10000
  const [params, setParams] = useSearchParams()
  const tengo = params.getAll('tengo')
  const max = Number(params.get('max')) || null
  const sugerencias = sugerirRecetas(RECETAS, tengo, max, INGREDIENTES)

  const actualizar = (nuevoTengo: string[], nuevoMax: number | null) => {
    const p = new URLSearchParams()
    for (const id of nuevoTengo) p.append('tengo', id)
    if (nuevoMax) p.set('max', String(nuevoMax))
    setParams(p, { replace: true })
  }
  const alternar = (id: string) => actualizar(tengo.includes(id) ? tengo.filter((t) => t !== id) : [...tengo, id], max)

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/hoy">
        Marca los ingredientes que tienes en la cocina y, si quieres, cuánto quieres gastar por porción. Te muestro primero las recetas a las que menos les falta.
      </EncabezadoPagina>

      <div className="grid gap-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <GrupoChips titulo="Lo que tengo" ayuda="La sal y las especias se dan por hechas.">
          {OPCIONES.map((i) => (
            <Chip key={i.id} activo={tengo.includes(i.id)} onChange={() => alternar(i.id)}>
              {i.nombre}
            </Chip>
          ))}
        </GrupoChips>
        <GrupoChips titulo="Presupuesto por porción">
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
          {RECETAS.some((r) => r.ejemplo) && <AvisoEjemplo texto="Recetas y precios de ejemplo" />}
        </div>
        <output aria-live="polite" className="sr-only">
          {tengo.length ? `${sugerencias.length} ${sugerencias.length === 1 ? 'receta sugerida' : 'recetas sugeridas'}` : ''}
        </output>

        {tengo.length === 0 ? (
          <EstadoVacio titulo="Marca lo que tienes" icono={Refrigerator} nivel="h3">
            <p>Elige al menos un ingrediente de la lista y aquí aparecen las recetas que puedes preparar con él.</p>
          </EstadoVacio>
        ) : sugerencias.length === 0 ? (
          <EstadoVacio
            titulo="Ninguna receta encaja todavía"
            icono={Refrigerator}
            nivel="h3"
            accion={
              <Boton variante="secundario" onClick={() => actualizar(tengo, null)}>
                Quitar el presupuesto
              </Boton>
            }
          >
            <p>Marca más ingredientes o sube el presupuesto por porción.</p>
          </EstadoVacio>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
            {sugerencias.map(({ receta, tienes, total, faltan }) => (
              <li key={receta.id} className="grid content-start gap-3">
                <p className="font-bold">
                  {faltan.length === 0 ? 'Tienes todo lo principal' : `Tienes ${tienes} de ${total}. Falta: ${faltan.join(', ')}.`}
                </p>
                <TarjetaReceta receta={receta} nivel="h3" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
