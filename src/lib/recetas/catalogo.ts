import categoriasJson from '@/data/categorias.json'
import ingredientesJson from '@/data/ingredientes.json'
import { crearCatalogo, juntarImagenes, porCarpeta } from './crearCatalogo'

// Catálogo real del sitio. Las recetas se cargan solas: agregar una carpeta en src/data/recetas/ no exige
// tocar componentes. Una receta inválida se omite del sitio (con aviso en la consola) en vez de romperlo;
// `npm test` la señala.

const catalogo = crearCatalogo({
  recetas: porCarpeta(import.meta.glob<unknown>('/src/data/recetas/*/receta.json', { eager: true, import: 'default' })),
  ingredientes: ingredientesJson,
  categorias: categoriasJson,
  imagenes: juntarImagenes(
    import.meta.glob<string>('/src/data/recetas/*/imagen.webp', { eager: true, import: 'default', query: '?url' }),
    import.meta.glob<string>('/src/data/recetas/*/miniatura.webp', { eager: true, import: 'default', query: '?url' }),
  ),
})

if (catalogo.errores.length) console.warn(`Moss Taste: datos con errores, se omiten:\n${catalogo.errores.join('\n')}`)

export const { ARCHIVOS_RECETAS, INGREDIENTES, CATEGORIAS, RECETAS, recetaPorSlug, categoria, ingrediente, imagenDe } = catalogo
