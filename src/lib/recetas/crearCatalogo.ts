import type { Categoria, Ingrediente, Receta } from './tipos.ts'
import { validarCategorias, validarIngredientes, validarReceta } from './validar.ts'

// Arma un catálogo validado a partir de los archivos crudos. Lo usan los datos reales (catalogo.ts)
// y los datos fijos de las pruebas (src/test/catalogoPrueba.ts), para que las pruebas de pantallas
// no dependan de qué recetas haya publicadas.

export interface DatosCrudos {
  /** receta.json crudo por slug (nombre de la carpeta). */
  recetas: Record<string, unknown>
  ingredientes: unknown
  categorias: unknown
  /** URLs de imagen.webp y miniatura.webp por slug. */
  imagenes?: Record<string, ArchivosImagen>
}

export interface ArchivosImagen {
  imagen?: string
  miniatura?: string
}

export interface ImagenReceta {
  imagen: string
  miniatura: string
  alt: string
  /** false si es la imagen de respaldo de la categoría, no la del plato. */
  propia: boolean
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
  /** La imagen de la receta; si no tiene, la de respaldo de su categoría; si tampoco, null. */
  imagenDe: (receta: Receta) => ImagenReceta | null
}

/** { '/src/data/recetas/ajiaco/receta.json': {...} } → { ajiaco: {...} } */
export function porCarpeta<T>(archivos: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(archivos).map(([ruta, valor]) => [ruta.split('/').at(-2) ?? ruta, valor]))
}

function completa(archivos: ArchivosImagen | undefined): { imagen: string; miniatura: string } | null {
  return archivos?.imagen && archivos.miniatura ? { imagen: archivos.imagen, miniatura: archivos.miniatura } : null
}

/** Junta las URLs de imagen.webp y miniatura.webp de cada carpeta. */
export function juntarImagenes(imagen: Record<string, string>, miniatura: Record<string, string>): Record<string, ArchivosImagen> {
  const res: Record<string, ArchivosImagen> = {}
  for (const [slug, url] of Object.entries(porCarpeta(imagen))) res[slug] = { ...res[slug], imagen: url }
  for (const [slug, url] of Object.entries(porCarpeta(miniatura))) res[slug] = { ...res[slug], miniatura: url }
  return res
}

export function crearCatalogo({ recetas, ingredientes, categorias, imagenes = {} }: DatosCrudos): Catalogo {
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
    imagenDe: (receta) => {
      const propia = completa(imagenes[receta.id])
      if (propia) return { ...propia, alt: receta.imagenAlt ?? '', propia: true }
      const slug = CATEGORIAS.find((c) => c.id === receta.categoria)?.imagenRespaldo
      const respaldo = slug ? completa(imagenes[slug]) : null
      // La de respaldo muestra otro plato: es decorativa, sin texto alternativo.
      return respaldo ? { ...respaldo, alt: '', propia: false } : null
    },
  }
}
