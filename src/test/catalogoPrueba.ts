import categorias from './datos/categorias.json'
import ingredientes from './datos/ingredientes.json'
import { crearCatalogo, juntarImagenes, porCarpeta } from '@/lib/recetas/crearCatalogo'

// Catálogo fijo para las pruebas: tres recetas ficticias que no cambian cuando cambian las publicadas.
// El ajiaco tiene imagen propia; los postres usan la del ajiaco como respaldo; los desayunos no tienen. Las pruebas de pantallas lo usan con:
//   vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))

const catalogo = crearCatalogo({
  recetas: porCarpeta(import.meta.glob<unknown>('/src/test/datos/recetas/*/receta.json', { eager: true, import: 'default' })),
  ingredientes,
  categorias,
  imagenes: juntarImagenes(
    import.meta.glob<string>('/src/test/datos/recetas/*/imagen.webp', { eager: true, import: 'default', query: '?url' }),
    import.meta.glob<string>('/src/test/datos/recetas/*/miniatura.webp', { eager: true, import: 'default', query: '?url' }),
  ),
})

if (catalogo.errores.length) throw new Error(`Los datos de prueba tienen errores:\n${catalogo.errores.join('\n')}`)

export const { ARCHIVOS_RECETAS, INGREDIENTES, CATEGORIAS, RECETAS, recetaPorSlug, categoria, ingrediente, imagenDe } = catalogo
