import type { Categoria, Ingrediente, Receta } from './tipos'
import { validarCategorias, validarIngredientes, validarReceta } from './validar'

// Arma un catálogo validado a partir de los archivos crudos. Lo usan los datos reales (catalogo.ts)
// y los datos fijos de las pruebas (src/test/catalogoPrueba.ts), para que las pruebas de pantallas
// no dependan de qué recetas haya publicadas.

export interface DatosCrudos {
  /** receta.json crudo por slug (nombre de la carpeta). */
  recetas: Record<string, unknown>
  ingredientes: unknown
  categorias: unknown
}

export interface Catalogo {
  ARCHIVOS_RECETAS: Record<string, unknown>
  INGREDIENTES: ReadonlyMap<string, Ingrediente>
  CATEGORIAS: readonly Categoria[]
  RECETAS: readonly Receta[]
  /** Errores de validación; los datos con errores se omiten. */
  errores: string[]
  recetaPorSlug: (slug: string) => Receta | undefined
  categoria: (id: string) => Categoria | undefined
  ingrediente: (id: string) => Ingrediente | undefined
}

/** { '/src/data/recetas/ajiaco/receta.json': {...} } → { ajiaco: {...} } */
export function porCarpeta<T>(archivos: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(archivos).map(([ruta, valor]) => [ruta.split('/').at(-2) ?? ruta, valor]))
}

export function crearCatalogo({ recetas, ingredientes, categorias }: DatosCrudos): Catalogo {
  const resIngredientes = validarIngredientes(ingredientes)
  const resCategorias = validarCategorias(categorias)
  const errores = [...resIngredientes.errores, ...resCategorias.errores]

  const INGREDIENTES: ReadonlyMap<string, Ingrediente> = new Map((resIngredientes.valor ?? []).map((i) => [i.id, i]))
  const CATEGORIAS: readonly Categoria[] = resCategorias.valor ?? []
  const idsCategorias = new Set(CATEGORIAS.map((c) => c.id))

  const RECETAS: readonly Receta[] = Object.entries(recetas)
    .flatMap(([slug, datos]) => {
      const resultado = validarReceta(datos, slug, INGREDIENTES, idsCategorias)
      errores.push(...resultado.errores)
      return resultado.valor ? [resultado.valor] : []
    })
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))

  return {
    ARCHIVOS_RECETAS: recetas,
    INGREDIENTES,
    CATEGORIAS,
    RECETAS,
    errores,
    recetaPorSlug: (slug) => RECETAS.find((r) => r.id === slug),
    categoria: (id) => CATEGORIAS.find((c) => c.id === id),
    ingrediente: (id) => INGREDIENTES.get(id),
  }
}
