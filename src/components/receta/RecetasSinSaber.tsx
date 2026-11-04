import { CircleHelp } from 'lucide-react'
import { esRecetaPersonal } from '@/lib/recetas/rutaReceta'
import type { Receta } from '@/lib/recetas/tipos'
import { TarjetaReceta } from './TarjetaReceta'

interface Props {
  recetas: readonly { receta: Receta; sinPrecio: readonly string[] }[]
}

// Con presupuesto, una receta a la que le falta un precio no pasa el filtro, pero tampoco desaparece
// en silencio: aparece aquí, al final, diciendo qué le falta por completar.
export function RecetasSinSaber({ recetas }: Props) {
  if (!recetas.length) return null
  return (
    <section aria-labelledby="titulo-sin-saber" className="grid gap-5 border-t border-line pt-8">
      <div className="grid gap-1">
        <h3 id="titulo-sin-saber" className="flex items-center gap-2 text-2xl">
          <CircleHelp aria-hidden="true" className="size-6 text-accent" strokeWidth={1.75} />
          No se puede saber si caben
        </h3>
        <p className="max-w-prose text-ink-soft">Les falta el precio de algún ingrediente, así que el costo es parcial y no cuentan como dentro del presupuesto.</p>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-6">
        {recetas.map(({ receta, sinPrecio }) => (
          <li key={receta.id} className="grid content-start gap-3">
            <p className="font-bold">
              {esRecetaPersonal(receta.id) && <span className="mr-2 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm text-ink">Tuya</span>}
              Falta el precio de: {sinPrecio.join(', ')}.
            </p>
            <TarjetaReceta receta={receta} nivel="h4" />
          </li>
        ))}
      </ul>
    </section>
  )
}
