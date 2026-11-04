import { useParams } from 'react-router-dom'
import { PanelReceta } from '@/components/cuenta/PanelReceta'
import { FichaReceta } from '@/components/receta/FichaReceta'
import { recetaPorSlug } from '@/lib/recetas/catalogo'
import { NoEncontrada } from './NoEncontrada'

export function Receta() {
  const { slug = '' } = useParams()
  const receta = recetaPorSlug(slug)
  // key: al pasar de una receta a otra, el estado (porciones, avisos) vuelve a empezar.
  return receta ? <FichaReceta key={receta.id} receta={receta} volver={{ a: '/recetas', texto: 'Todas las recetas' }} extra={<PanelReceta slug={receta.id} />} /> : <NoEncontrada />
}
