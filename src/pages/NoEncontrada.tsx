import { BookOpen, House } from 'lucide-react'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { useMetadatos } from '@/lib/useMetadatos'

export function NoEncontrada() {
  useMetadatos({
    titulo: 'Página no encontrada',
    descripcion: 'Esta dirección no existe en Moss Taste.',
    indexable: false,
  })
  return (
    <div className="grid max-w-prose gap-6 py-6">
      <h1 tabIndex={-1} className="text-4xl outline-none">
        Esta página no existe
      </h1>
      <p className="text-lg text-ink-soft">
        Puede que el enlace esté mal escrito o que la receta haya cambiado de nombre. Busca en el recetario o vuelve al inicio.
      </p>
      <div className="flex flex-wrap gap-3">
        <BotonEnlace to="/recetas" icono={<BookOpen aria-hidden="true" className="size-5" />}>
          Ver recetas
        </BotonEnlace>
        <BotonEnlace to="/" variante="secundario" icono={<House aria-hidden="true" className="size-5" />}>
          Ir al inicio
        </BotonEnlace>
      </div>
    </div>
  )
}
