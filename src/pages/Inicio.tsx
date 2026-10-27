import { BookOpen, Refrigerator } from 'lucide-react'
import { AvisoEjemplo } from '@/components/receta/AvisoEjemplo'
import { TarjetaReceta } from '@/components/receta/TarjetaReceta'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { useMetadatos } from '@/lib/useMetadatos'
import { RECETAS } from '@/lib/recetas/catalogo'
import { rutaFija } from '@/rutas'

export function Inicio() {
  useMetadatos(rutaFija('/'))
  const hayEjemplos = RECETAS.some((r) => r.ejemplo)

  return (
    <div className="grid gap-16">
      <section className="grid max-w-3xl gap-6 pt-4">
        <h1 tabIndex={-1} className="text-4xl outline-none sm:text-[3.5rem] sm:leading-[1.02]">
          El recetario de la familia
        </h1>
        <p className="max-w-prose text-xl text-ink-soft">
          Las recetas de la casa, con las cantidades y el costo en pesos colombianos para las porciones que vayas a servir.
        </p>
        <div className="flex flex-wrap gap-3">
          <BotonEnlace to="/recetas" tamano="lg" icono={<BookOpen aria-hidden="true" className="size-5" />}>
            Ver recetas
          </BotonEnlace>
          <BotonEnlace to="/hoy" tamano="lg" variante="secundario" icono={<Refrigerator aria-hidden="true" className="size-5" />}>
            ¿Qué cocino hoy?
          </BotonEnlace>
        </div>
      </section>

      <section aria-labelledby="titulo-destacadas" className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titulo-destacadas" className="text-3xl">
            Recetas destacadas
          </h2>
          {hayEjemplos && <AvisoEjemplo texto="Recetas y precios de ejemplo" />}
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
          {RECETAS.slice(0, 3).map((receta) => (
            <li key={receta.id} className="grid">
              <TarjetaReceta receta={receta} nivel="h3" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-hoy" className="grid gap-4 rounded-xl bg-surface p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-10">
        <div className="grid gap-2">
          <h2 id="titulo-hoy" className="text-3xl">
            ¿No sabes qué cocinar?
          </h2>
          <p className="max-w-prose text-lg text-ink-soft">
            Dime qué ingredientes tienes en la cocina y cuánto quieres gastar, y te muestro las recetas que te sirven.
          </p>
        </div>
        <BotonEnlace to="/hoy" tamano="lg" variante="secundario">
          Buscar con lo que tengo
        </BotonEnlace>
      </section>
    </div>
  )
}
