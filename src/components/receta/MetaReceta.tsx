import { Clock, Tag, Users } from 'lucide-react'
import { formatoMinutos, formatoPorciones } from '@/lib/formato'
import { categoria } from '@/lib/recetas/catalogo'
import type { Receta } from '@/lib/recetas/tipos'
import { cx } from '@/lib/clases'

// Tiempo, porciones y categoría como chips: cada dato con su ícono y su texto.
interface Props {
  receta: Receta
  conCategoria?: boolean
  /** En la ficha se omite: el selector ya muestra las porciones elegidas. */
  conPorciones?: boolean
  className?: string
}

export function MetaReceta({ receta, conCategoria = true, conPorciones = true, className }: Props) {
  const datos = [
    { Icono: Clock, texto: formatoMinutos(receta.tiempoMin), etiqueta: 'Tiempo' },
    ...(conPorciones ? [{ Icono: Users, texto: formatoPorciones(receta.porcionesBase), etiqueta: 'Rinde' }] : []),
    ...(conCategoria ? [{ Icono: Tag, texto: categoria(receta.categoria)?.nombre ?? receta.categoria, etiqueta: 'Categoría' }] : []),
  ]
  return (
    <ul className={cx('flex flex-wrap gap-2', className)}>
      {datos.map(({ Icono, texto, etiqueta }) => (
        <li key={etiqueta} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm text-ink-soft">
          <Icono aria-hidden="true" className="size-4" />
          <span className="sr-only">{etiqueta}: </span>
          {texto}
        </li>
      ))}
    </ul>
  )
}
