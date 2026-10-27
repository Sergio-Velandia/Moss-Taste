import { useParams } from 'react-router-dom'
import { useMetadatos } from '@/lib/useMetadatos'

// Modo cocina: pantalla completa, fuera del layout general. Se diseña en su propio paso.
export function Cocinar() {
  const { slug = '' } = useParams()
  useMetadatos({ titulo: 'Modo cocina', descripcion: 'La receta paso a paso, con letra grande.', ruta: `/recetas/${slug}/cocinar`, indexable: false })
  return (
    <main id="contenido" className="grid min-h-dvh place-items-center p-4">
      <h1 tabIndex={-1} className="text-4xl outline-none">
        Modo cocina
      </h1>
    </main>
  )
}
