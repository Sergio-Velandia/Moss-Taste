import { normalizar } from '@/lib/formato'
import { costoProvisional } from './costoProvisional'
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

export function filtrarRecetas(recetas: readonly Receta[], filtros: Filtros, catalogo: ReadonlyMap<string, Ingrediente>): Receta[] {
  const palabras = normalizar(filtros.q).split(/\s+/).filter(Boolean)
  return recetas.filter((receta) => {
    if (filtros.categorias.length && !filtros.categorias.includes(receta.categoria)) return false
    if (filtros.ingrediente && !receta.ingredientes.some((i) => i.ingrediente === filtros.ingrediente)) return false
    if (filtros.maxPorcion && costoProvisional(receta, catalogo).porPorcion > filtros.maxPorcion) return false
    if (palabras.length) {
      // Cada palabra debe aparecer en el título, el resumen o algún ingrediente.
      const texto = normalizar(
        [receta.titulo, receta.resumen, ...receta.ingredientes.map((i) => catalogo.get(i.ingrediente)?.nombre ?? '')].join(' '),
      )
      if (!palabras.every((p) => texto.includes(p))) return false
    }
    return true
  })
}
