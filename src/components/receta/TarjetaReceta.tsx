import { Link } from 'react-router-dom'
import { formatoCOP } from '@/lib/formato'
import { INGREDIENTES } from '@/lib/recetas/catalogo'
import { calcularReceta } from '@/lib/calculo/costo'
import type { Receta } from '@/lib/recetas/tipos'
import { AvisoEjemplo } from './AvisoEjemplo'
import { IlustracionCategoria } from './IlustracionCategoria'
import { MetaReceta } from './MetaReceta'

// Toda la tarjeta es clicable por el enlace del título (se estira con ::after), así hay un solo
// elemento enfocable y el lector de pantalla anuncia el nombre de la receta.
export function TarjetaReceta({ receta, nivel: Titulo = 'h2' }: { receta: Receta; nivel?: 'h2' | 'h3' }) {
  const costo = calcularReceta(receta, receta.porcionesBase, INGREDIENTES)
  return (
    <article className="relative grid grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-line bg-surface hover:border-accent has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent">
      <IlustracionCategoria categoria={receta.categoria} className="aspect-[4/3]" />
      <div className="grid content-start gap-3 p-5">
        {receta.ejemplo && <AvisoEjemplo />}
        <Titulo className="text-2xl">
          <Link to={`/recetas/${receta.id}`} className="outline-none after:absolute after:inset-0 hover:underline hover:decoration-accent hover:underline-offset-4">
            {receta.titulo}
          </Link>
        </Titulo>
        <p className="line-clamp-2 text-ink-soft">{receta.resumen}</p>
        <MetaReceta receta={receta} conCategoria={false} />
        {costo.total > 0 && (
          <p className="text-sm text-ink-soft tabular-nums">
            Alrededor de <strong className="font-bold text-ink">{formatoCOP(costo.porPorcion)}</strong> por porción
          </p>
        )}
      </div>
    </article>
  )
}
