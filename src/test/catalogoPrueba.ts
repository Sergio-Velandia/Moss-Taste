import categorias from './datos/categorias.json'
import ingredientes from './datos/ingredientes.json'
import { crearCatalogo, porCarpeta } from '@/lib/recetas/crearCatalogo'

// Catálogo fijo para las pruebas: tres recetas ficticias (ajiaco, arepas de queso y arroz con leche) que
// no cambian cuando cambian las recetas publicadas. Las pruebas de pantallas lo usan con:
//   vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))

const catalogo = crearCatalogo({
  recetas: porCarpeta(import.meta.glob<unknown>('/src/test/datos/recetas/*/receta.json', { eager: true, import: 'default' })),
  ingredientes,
  categorias,
})

if (catalogo.errores.length) throw new Error(`Los datos de prueba tienen errores:\n${catalogo.errores.join('\n')}`)

export const { ARCHIVOS_RECETAS, INGREDIENTES, CATEGORIAS, RECETAS, recetaPorSlug, categoria, ingrediente } = catalogo
