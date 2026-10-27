import { useParams } from 'react-router-dom'
import { useMetadatos } from '@/lib/useMetadatos'

// Modo lectura. El contenido de la receta llega con los datos de ejemplo.
export function Receta() {
  const { slug = '' } = useParams()
  useMetadatos({ titulo: 'Receta', descripcion: 'Receta con cantidades y costo para cualquier número de porciones.', ruta: `/recetas/${slug}` })
  return (
    <div className="grid gap-10">
      <h1 tabIndex={-1} className="text-4xl outline-none">
        Receta
      </h1>
    </div>
  )
}
