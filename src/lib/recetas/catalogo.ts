import categoriasJson from '@/data/categorias.json'
import ingredientesJson from '@/data/ingredientes.json'
import type { Categoria, Ingrediente, Receta } from './tipos'
import { validarCategorias, validarIngredientes, validarReceta } from './validar'

// Las recetas se cargan solas: agregar una carpeta en src/data/recetas/ no exige tocar componentes.
// Una receta inválida se omite del sitio (con aviso en la consola) en vez de romperlo; `npm test` la señala.

/** Archivos receta.json crudos por slug. También los usa la prueba de datos. */
export const ARCHIVOS_RECETAS: Record<string, unknown> = Object.fromEntries(
  Object.entries(import.meta.glob<unknown>('/src/data/recetas/*/receta.json', { eager: true, import: 'default' })).map(([ruta, datos]) => [
    ruta.split('/').at(-2) ?? ruta,
    datos,
  ]),
)

function avisar(errores: string[]) {
  if (errores.length) console.warn(`Moss Taste: datos con errores, se omiten:\n${errores.join('\n')}`)
}

const resIngredientes = validarIngredientes(ingredientesJson)
const resCategorias = validarCategorias(categoriasJson)
avisar([...resIngredientes.errores, ...resCategorias.errores])

export const INGREDIENTES: ReadonlyMap<string, Ingrediente> = new Map((resIngredientes.valor ?? []).map((i) => [i.id, i]))
export const CATEGORIAS: readonly Categoria[] = resCategorias.valor ?? []
const idsCategorias = new Set(CATEGORIAS.map((c) => c.id))

export const RECETAS: readonly Receta[] = Object.entries(ARCHIVOS_RECETAS)
  .flatMap(([slug, datos]) => {
    const { valor, errores } = validarReceta(datos, slug, INGREDIENTES, idsCategorias)
    avisar(errores)
    return valor ? [valor] : []
  })
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))

export function recetaPorSlug(slug: string): Receta | undefined {
  return RECETAS.find((r) => r.id === slug)
}

export function categoria(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id)
}

export function ingrediente(id: string): Ingrediente | undefined {
  return INGREDIENTES.get(id)
}
