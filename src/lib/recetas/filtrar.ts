import { normalizar } from '@/lib/formato'
import { calcularReceta, topePorPorcion } from '@/lib/calculo/costo'
import type { Ingrediente, Receta } from './tipos'

// Filtros de la galería. Viven en la URL (?q=&categoria=&ingrediente=&max=) para poder compartirlos.

export interface Filtros {
  q: string
  categorias: string[]
  ingrediente: string | null
  /** Costo máximo por porción, en COP. */
  maxPorcion: number | null
}

export const PRESUPUESTOS = [5000, 10000, 20000] as const
export const AYUDA_PRESUPUESTO = 'Cuenta el costo más alto del estimado (+10 %), para que no te falte en la tienda.'

export function leerFiltros(params: URLSearchParams): Filtros {
  const max = Number(params.get('max'))
  return {
    q: params.get('q') ?? '',
    categorias: params.getAll('categoria'),
    ingrediente: params.get('ingrediente') || null,
    maxPorcion: Number.isInteger(max) && max > 0 ? max : null,
  }
}

export function escribirFiltros(filtros: Filtros): URLSearchParams {
  const params = new URLSearchParams()
  if (filtros.q.trim()) params.set('q', filtros.q)
  for (const c of filtros.categorias) params.append('categoria', c)
  if (filtros.ingrediente) params.set('ingrediente', filtros.ingrediente)
  if (filtros.maxPorcion) params.set('max', String(filtros.maxPorcion))
  return params
}

export const hayFiltros = (f: Filtros): boolean => Boolean(f.q.trim() || f.categorias.length || f.ingrediente || f.maxPorcion)

/** Lo que no es presupuesto: texto, categoría e ingrediente. */
function coincideSinPresupuesto(receta: Receta, filtros: Filtros, catalogo: ReadonlyMap<string, Ingrediente>): boolean {
  const palabras = normalizar(filtros.q).split(/\s+/).filter(Boolean)
  if (filtros.categorias.length && !filtros.categorias.includes(receta.categoria)) return false
  if (filtros.ingrediente && !receta.ingredientes.some((i) => i.ingrediente === filtros.ingrediente)) return false
  if (palabras.length) {
    // Cada palabra debe aparecer en el título, el resumen o algún ingrediente.
    const texto = normalizar(
      [receta.titulo, receta.resumen, ...receta.ingredientes.map((i) => catalogo.get(i.ingrediente)?.nombre ?? '')].join(' '),
    )
    if (!palabras.every((p) => texto.includes(p))) return false
  }
  return true
}

export function filtrarRecetas(recetas: readonly Receta[], filtros: Filtros, catalogo: ReadonlyMap<string, Ingrediente>): Receta[] {
  return recetas.filter((receta) => {
    if (!coincideSinPresupuesto(receta, filtros, catalogo)) return false
    if (!filtros.maxPorcion) return true
    const tope = topePorPorcion(calcularReceta(receta, receta.porcionesBase, catalogo))
    return tope !== null && tope <= filtros.maxPorcion
  })
}

/** Con presupuesto: las que coinciden con lo demás, pero no se sabe si caben porque les falta algún precio. */
export function sinSaberSiCaben(recetas: readonly Receta[], filtros: Filtros, catalogo: ReadonlyMap<string, Ingrediente>) {
  if (!filtros.maxPorcion) return []
  return recetas.flatMap((receta) => {
    if (!coincideSinPresupuesto(receta, filtros, catalogo)) return []
    const calculo = calcularReceta(receta, receta.porcionesBase, catalogo)
    return topePorPorcion(calculo) === null ? [{ receta, sinPrecio: calculo.sinPrecio }] : []
  })
}
