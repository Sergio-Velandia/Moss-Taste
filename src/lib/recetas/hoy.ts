import { calcularReceta, costoPorPorcionConocido } from '@/lib/calculo/costo'
import type { Ingrediente, Receta } from './tipos'

// «¿Qué cocino hoy?» sin algoritmo complejo: cuenta cuántos ingredientes principales tienes de cada receta.
// Los ingredientes «al gusto» (sal, especias) y los opcionales no cuentan como faltantes.

export interface Sugerencia {
  receta: Receta
  tienes: number
  total: number
  /** Nombres de los ingredientes principales que faltan. */
  faltan: string[]
}

export function sugerirRecetas(
  recetas: readonly Receta[],
  tengo: readonly string[],
  maxPorcion: number | null,
  catalogo: ReadonlyMap<string, Ingrediente>,
): Sugerencia[] {
  const disponibles = new Set(tengo)
  return recetas
    .filter((r) => {
      if (!maxPorcion) return true
      // Sin precios no se sabe si cumple el presupuesto.
      const porPorcion = costoPorPorcionConocido(calcularReceta(r, r.porcionesBase, catalogo))
      return porPorcion !== null && porPorcion <= maxPorcion
    })
    .map((receta) => {
      const principales = receta.ingredientes.filter((i) => !i.ajustarAlGusto && !i.opcional)
      const faltantes = principales.filter((i) => !disponibles.has(i.ingrediente))
      return {
        receta,
        tienes: principales.length - faltantes.length,
        total: principales.length,
        faltan: faltantes.map((i) => catalogo.get(i.ingrediente)?.nombre ?? i.ingrediente),
      }
    })
    .filter((s) => s.tienes > 0)
    .sort((a, b) => a.faltan.length - b.faltan.length || b.tienes - a.tienes || a.receta.titulo.localeCompare(b.receta.titulo, 'es'))
}
