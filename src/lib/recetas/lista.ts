import type { Ingrediente, Receta, Unidad } from './tipos'

/*
 * PROVISIONAL (Fase 1): suma los ingredientes de varias recetas en sus porciones base, juntando solo
 * los que tienen la misma unidad. La Fase 4 la reemplaza con el cálculo real (porciones, unidades y merma).
 */

export interface ItemLista {
  clave: string
  ingrediente: Ingrediente | undefined
  idIngrediente: string
  cantidad: number
  unidad: Unidad
  /** Títulos de las recetas que lo piden. */
  recetas: string[]
  /** COP entero, o null si no se puede calcular. */
  subtotal: number | null
}

export function sumarLista(recetas: readonly Receta[], catalogo: ReadonlyMap<string, Ingrediente>): ItemLista[] {
  const items = new Map<string, ItemLista>()
  for (const receta of recetas) {
    for (const { ingrediente: id, cantidad, unidad } of receta.ingredientes) {
      const clave = `${id}:${unidad}`
      const item = items.get(clave)
      if (item) {
        item.cantidad += cantidad
        item.recetas.push(receta.titulo)
      } else {
        items.set(clave, { clave, ingrediente: catalogo.get(id), idIngrediente: id, cantidad, unidad, recetas: [receta.titulo], subtotal: null })
      }
    }
  }
  return [...items.values()]
    .map((item) => {
      const ing = item.ingrediente
      const subtotal = ing && ing.precio !== null && ing.unidadBase === item.unidad ? Math.round((ing.precio * item.cantidad) / ing.porCantidad) : null
      return { ...item, subtotal }
    })
    .sort((a, b) => (a.ingrediente?.nombre ?? a.idIngrediente).localeCompare(b.ingrediente?.nombre ?? b.idIngrediente, 'es'))
}
