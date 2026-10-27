import { calcularReceta } from '@/lib/calculo/costo'
import type { Ingrediente, Receta } from './tipos'

// «¿Qué cocino hoy?» sin algoritmo complejo: cuenta cuántos ingredientes principales tienes de cada receta.
// Los ingredientes «al gusto» (sal, especias) no cuentan como faltantes.

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
    .filter((r) => !maxPorcion || calcularReceta(r, r.porcionesBase, catalogo).porPorcion <= maxPorcion)
    .map((receta) => {
      const principales = receta.ingredientes.filter((i) => !i.ajustarAlGusto)
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
