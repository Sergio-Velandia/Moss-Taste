import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { useParams } from 'react-router-dom'
import { ModoCocina } from '@/features/cocina/ModoCocina'
import { useDatosCuenta } from '@/lib/cuentas/datos'
import { useMetadatos } from '@/lib/useMetadatos'
import { NoEncontrada } from './NoEncontrada'

// Modo cocina de una receta personal: el mismo de las públicas, detrás de la ruta protegida.
export function CocinarMia() {
  const { id = '' } = useParams()
  const { recetas } = useDatosCuenta()
  const receta = recetas.find((r) => r.id === id)
  useMetadatos({ titulo: receta ? `Cocinando: ${receta.titulo}` : 'Página no encontrada', descripcion: 'Tu receta paso a paso, con letra grande.', indexable: false })

  if (!receta)
    return (
      <main id="contenido" className="mx-auto max-w-3xl px-4 py-12">
        <NoEncontrada />
      </main>
    )

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <ModoCocina key={receta.id} receta={receta} />
      </LazyMotion>
    </MotionConfig>
  )
}
