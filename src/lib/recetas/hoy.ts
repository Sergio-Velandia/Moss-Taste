import { calcularReceta, topePorPorcion } from '@/lib/calculo/costo'
import { alternativaDe } from './alternativa'
import type { Ingrediente, IngredienteReceta, Receta } from './tipos'

// «¿Qué cocino hoy?» sin algoritmo complejo: cuenta cuántos ingredientes principales tienes de cada receta.
// Se dan por hechos los «al gusto» (sal, especias), los opcionales y lo que no se costea (el agua de la llave).
// Las recetas personales entran igual que las públicas.

export interface Sugerencia {
  receta: Receta
  tienes: number
  total: number
  /** Los ingredientes principales que faltan, con su alternativa: «Calado (o pan tostado)». */
  faltan: string[]
  /** Lo que usa el filtro de presupuesto: el extremo alto del estimado. null si no se puede saber. */
  tope: number | null
  /** Nombres de lo que no tiene precio. */
  sinPrecio: string[]
}

export interface ResultadoHoy {
  sugerencias: Sugerencia[]
  /** Con presupuesto: las que no se sabe si caben porque les falta algún precio. No se esconden en silencio. */
  sinSaber: Sugerencia[]
}

export interface OpcionesHoy {
  /** Ingredientes del catálogo, con precio y fecha. */
  catalogo: Ingrediente[]
  /** Nombres que escribió la persona en sus recetas: no están en el catálogo y no tienen precio. Van aparte. */
  libres: string[]
}

function esPrincipal(item: IngredienteReceta, catalogo: ReadonlyMap<string, Ingrediente>): boolean {
  return !item.ajustarAlGusto && !item.opcional && !catalogo.get(item.ingrediente)?.noSeCostea
}

export function opcionesDeHoy(recetas: readonly Receta[], catalogo: ReadonlyMap<string, Ingrediente>): OpcionesHoy {
  const ids = new Set(recetas.flatMap((r) => r.ingredientes.filter((i) => esPrincipal(i, catalogo)).map((i) => i.ingrediente)))
  const delCatalogo = [...ids].flatMap((id) => catalogo.get(id) ?? [])
  return {
    catalogo: delCatalogo.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    libres: [...ids].filter((id) => !catalogo.has(id)).sort((a, b) => a.localeCompare(b, 'es')),
  }
}

function aSugerencia(receta: Receta, disponibles: ReadonlySet<string>, catalogo: ReadonlyMap<string, Ingrediente>): Sugerencia {
  const principales = receta.ingredientes.filter((i) => esPrincipal(i, catalogo))
  const faltantes = principales.filter((i) => !disponibles.has(i.ingrediente))
  const calculo = calcularReceta(receta, receta.porcionesBase, catalogo)
  return {
    receta,
    tienes: principales.length - faltantes.length,
    total: principales.length,
    faltan: faltantes.map((item) => {
      const ingrediente = catalogo.get(item.ingrediente)
      const alternativa = alternativaDe(item, ingrediente)
      const nombre = ingrediente?.nombre ?? item.ingrediente
      return alternativa ? `${nombre} (${alternativa})` : nombre
    }),
    tope: topePorPorcion(calculo),
    sinPrecio: calculo.sinPrecio,
  }
}

/** Sin ingredientes marcados, el presupuesto solo ya lista lo que cabe. Sin ninguno de los dos, no sugiere nada. */
export function sugerirRecetas(recetas: readonly Receta[], tengo: readonly string[], maxPorcion: number | null, catalogo: ReadonlyMap<string, Ingrediente>): ResultadoHoy {
  if (!tengo.length && !maxPorcion) return { sugerencias: [], sinSaber: [] }
  const disponibles = new Set(tengo)
  const todas = recetas.map((r) => aSugerencia(r, disponibles, catalogo)).filter((s) => !tengo.length || s.tienes > 0)
  const orden = (a: Sugerencia, b: Sugerencia) =>
    (tengo.length ? a.faltan.length - b.faltan.length || b.tienes - a.tienes : (a.tope ?? 0) - (b.tope ?? 0)) || a.receta.titulo.localeCompare(b.receta.titulo, 'es')
  return {
    sugerencias: todas.filter((s) => !maxPorcion || (s.tope !== null && s.tope <= maxPorcion)).sort(orden),
    sinSaber: maxPorcion ? todas.filter((s) => s.tope === null).sort(orden) : [],
  }
}
