import { BookHeart, ChefHat, CircleCheckBig, LogIn, NotebookPen, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { EstadoVacio } from '@/components/ui/Estados'
import { formatoFecha } from '@/lib/formato'
import { recetaPorSlug } from '@/lib/recetas/catalogo'

// Vista de ejemplo: así se verá Mi cocina cuando existan las cuentas (Fase 6). Ningún dato es real.
const FAVORITAS = ['ajiaco-santafereno', 'arroz-con-leche']
const PROBADAS = [
  { id: 'arepas-de-queso', fecha: '2026-10-12' },
  { id: 'ajiaco-santafereno', fecha: '2026-10-05' },
]
const NOTAS = [
  { id: 'ajiaco-santafereno', texto: 'Con la mitad de la sal queda mejor para los niños.' },
  { id: 'arepas-de-queso', texto: 'Si la masa se agrieta, un chorrito más de leche tibia.' },
]

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

export function MiCocina() {
  return (
    <div className="grid gap-14">
      <EncabezadoPagina ruta="/mi-cocina" />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent-soft p-5">
        <div className="grid gap-1">
          <AvisoEjemplo texto="Vista de ejemplo" className="bg-surface" />
          <p className="max-w-prose">Así se verá tu cocina cuando las cuentas estén listas. Lo que ves aquí son datos ficticios.</p>
        </div>
        <BotonEnlace to="/acceso" icono={<LogIn aria-hidden="true" className="size-5" />}>
          Entrar
        </BotonEnlace>
      </div>

      <Seccion id="titulo-favoritas" titulo="Favoritas" Icono={BookHeart}>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
          {FAVORITAS.map((id) => {
            const receta = recetaPorSlug(id)
            return receta ? (
              <li key={id} className="grid">
                <TarjetaReceta receta={receta} nivel="h3" />
              </li>
            ) : null
          })}
        </ul>
      </Seccion>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
        <Seccion id="titulo-probadas" titulo="Ya la probé" Icono={CircleCheckBig}>
          <ul className="grid">
            {PROBADAS.map(({ id, fecha }) => (
              <li key={id} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line py-3 last:border-b-0">
                <Link to={`/recetas/${id}`} className="font-bold hover:underline">
                  {recetaPorSlug(id)?.titulo}
                </Link>
                <span className="text-sm text-ink-soft">{formatoFecha(fecha)}</span>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion id="titulo-notas" titulo="Notas" Icono={NotebookPen}>
          <ul className="grid gap-4">
            {NOTAS.map(({ id, texto }) => (
              <li key={id} className="grid gap-1 border-l-2 border-accent pl-4">
                <Link to={`/recetas/${id}`} className="text-sm font-bold text-ink-soft hover:underline">
                  {recetaPorSlug(id)?.titulo}
                </Link>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
        </Seccion>
      </div>

      <Seccion id="titulo-mias" titulo="Mis recetas" Icono={ChefHat}>
        <EstadoVacio
          titulo="Todavía no tienes recetas propias"
          nivel="h3"
          accion={
            <BotonEnlace to="/mi-cocina/nueva" icono={<Plus aria-hidden="true" className="size-5" />}>
              Crear receta
            </BotonEnlace>
          }
        >
          <p>Tus recetas son privadas: solo las ves tú. Si quieres que una entre al recetario de todos, proponla en Contacto.</p>
        </EstadoVacio>
      </Seccion>
    </div>
  )
}
