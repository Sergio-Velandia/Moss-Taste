import { BookHeart, ChefHat, CircleCheckBig, NotebookPen, Plus, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MisDatos } from '@/components/cuenta/MisDatos'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { EstadoVacio } from '@/components/ui/Estados'
import { TOPES } from '@/lib/cuentas/config'
import { useDatosCuenta } from '@/lib/cuentas/datos'
import { useSesion } from '@/lib/cuentas/sesion'
import { formatoFecha } from '@/lib/formato'
import { recetaPorSlug } from '@/lib/recetas/catalogo'

function Seccion({ id, titulo, Icono, children }: { id: string; titulo: string; Icono: typeof BookHeart; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5">
      <h2 id={id} className="flex items-center gap-3 text-3xl">
        <Icono aria-hidden="true" className="size-7 text-accent" strokeWidth={1.75} />
        {titulo}
      </h2>
      {children}
    </section>
  )
}

const VerRecetas = () => (
  <BotonEnlace to="/recetas" variante="secundario">
    Ver recetas
  </BotonEnlace>
)

// Solo se llega aquí con sesión activa (RutaProtegida). Las recetas públicas que ya no existan se ignoran.
export function MiCocina() {
  const sesion = useSesion()
  const { interacciones, recetas, avisoLista } = useDatosCuenta()
  const conReceta = Object.entries(interacciones).flatMap(([id, i]) => {
    const receta = recetaPorSlug(id)
    return receta ? [{ receta, ...i }] : []
  })
  const favoritas = conReceta.filter((i) => i.favorita)
  const probadas = conReceta.filter((i) => i.probada).sort((a, b) => b.probada.localeCompare(a.probada))
  const notas = conReceta.filter((i) => i.nota)

  return (
    <div className="grid gap-14">
      <EncabezadoPagina ruta="/mi-cocina" />

      {avisoLista && (
        <p className="max-w-prose rounded-md bg-accent-soft px-4 py-3">
          {avisoLista}{' '}
          <Link to="/lista" className="font-bold text-accent underline underline-offset-4">
            Ver la lista
          </Link>
        </p>
      )}

      <Seccion id="titulo-favoritas" titulo="Favoritas" Icono={BookHeart}>
        {favoritas.length ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
            {favoritas.map(({ receta }) => (
              <li key={receta.id} className="grid">
                <TarjetaReceta receta={receta} nivel="h3" />
              </li>
            ))}
          </ul>
        ) : (
          <EstadoVacio titulo="Todavía no tienes favoritas" nivel="h3" accion={<VerRecetas />}>
            <p>En cada receta, toca «Favorita» para tenerla a la mano aquí.</p>
          </EstadoVacio>
        )}
      </Seccion>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
        <Seccion id="titulo-probadas" titulo="Ya la probé" Icono={CircleCheckBig}>
          {probadas.length ? (
            <ul className="grid">
              {probadas.map(({ receta, probada }) => (
                <li key={receta.id} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3 last:border-b-0">
                  <Link to={`/recetas/${receta.id}`} className="font-bold hover:underline">
                    {receta.titulo}
                  </Link>
                  <span className="text-sm text-ink-soft">{formatoFecha(probada)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">Cuando cocines una receta, márcala con «Ya la probé» y queda aquí con su fecha.</p>
          )}
        </Seccion>

        <Seccion id="titulo-notas" titulo="Notas" Icono={NotebookPen}>
          {notas.length ? (
            <ul className="grid gap-4">
              {notas.map(({ receta, nota }) => (
                <li key={receta.id} className="grid gap-1 border-l-2 border-accent pl-4">
                  <Link to={`/recetas/${receta.id}`} className="text-sm font-bold text-ink-soft hover:underline">
                    {receta.titulo}
                  </Link>
                  <p className="whitespace-pre-line">{nota}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">Tus notas de cada receta aparecen aquí. Otras cuentas no las ven.</p>
          )}
        </Seccion>
      </div>

      <Seccion id="titulo-mias" titulo="Mis recetas" Icono={ChefHat}>
        {recetas.length ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-soft tabular-nums">
                {recetas.length} de {TOPES.recetas}. Son privadas: otras cuentas no las ven. Para proponer una al recetario de todos, usa{' '}
                <Link to="/contacto" className="font-bold text-accent underline underline-offset-4">
                  Contacto
                </Link>
                .
              </p>
              <BotonEnlace to="/mi-cocina/nueva" icono={<Plus aria-hidden="true" className="size-5" />}>
                Crear receta
              </BotonEnlace>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
              {recetas.map((receta) => (
                <li key={receta.id} className="grid">
                  <TarjetaReceta receta={receta} nivel="h3" />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EstadoVacio
            titulo="Todavía no tienes recetas propias"
            nivel="h3"
            accion={
              <BotonEnlace to="/mi-cocina/nueva" icono={<Plus aria-hidden="true" className="size-5" />}>
                Crear receta
              </BotonEnlace>
            }
          >
            <p>Tus recetas son privadas: otras cuentas no las ven. Si quieres que una entre al recetario de todos, proponla en Contacto.</p>
          </EstadoVacio>
        )}
      </Seccion>

      <Seccion id="titulo-datos" titulo="Mis datos" Icono={ShieldCheck}>
        {sesion.fase === 'activa' && <MisDatos usuario={sesion.usuario} />}
      </Seccion>
    </div>
  )
}
