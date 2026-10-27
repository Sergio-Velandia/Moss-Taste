import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { useParams } from 'react-router-dom'
import { ModoCocina } from '@/features/cocina/ModoCocina'
import { recetaPorSlug } from '@/lib/recetas/catalogo'
import { useMetadatos } from '@/lib/useMetadatos'
import { NoEncontrada } from './NoEncontrada'

// Modo cocina: pantalla completa, fuera del layout general. Motion solo se carga en esta ruta.
export function Cocinar() {
  const { slug = '' } = useParams()
  const receta = recetaPorSlug(slug)
  useMetadatos({
    titulo: receta ? `Cocinando: ${receta.titulo}` : 'Página no encontrada',
    descripcion: receta ? `${receta.titulo} paso a paso, con letra grande.` : 'Esta dirección no existe en Moss Taste.',
    ruta: `/recetas/${slug}/cocinar`,
    indexable: false,
  })

  if (!receta)
    return (
      <main id="contenido" className="mx-auto max-w-3xl px-4 py-12">
        <NoEncontrada />
      </main>
    )

  return (
    // reducedMotion="user": con movimiento reducido, los pasos cambian solo con un fundido, sin desplazamiento.
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <ModoCocina key={receta.id} receta={receta} />
      </LazyMotion>
    </MotionConfig>
  )
}
