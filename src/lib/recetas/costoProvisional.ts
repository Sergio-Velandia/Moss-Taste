import type { Ingrediente, IngredienteReceta, Receta } from './tipos'

/*
 * PROVISIONAL (Fase 1). Costo de la receta en sus porciones base, sin escalar porciones,
 * sin convertir unidades y sin aplicar merma. El cerebro de cálculo de la Fase 2 lo reemplaza.
 * Si un ingrediente no tiene precio o su unidad no coincide con la del catálogo, la línea queda
 * sin precio y se dice: nunca se asume cero.
 */

export interface LineaCosto {
  item: IngredienteReceta
  ingrediente: Ingrediente | undefined
  /** COP entero, o null si no se puede calcular. */
  subtotal: number | null
}

export interface CostoReceta {
  lineas: LineaCosto[]
  total: number
  /** Rango de ±10 %. */
  minimo: number
  maximo: number
  porPorcion: number
  porPorcionMinimo: number
  porPorcionMaximo: number
  /** Nombres de los ingredientes que no suman al total. */
  sinPrecio: string[]
  /** Fecha del precio más antiguo usado (AAAA-MM-DD), o null si ninguno tiene precio. */
  fechaPrecio: string | null
}

const RANGO = 0.1

function subtotal(item: IngredienteReceta, ingrediente: Ingrediente | undefined): number | null {
  if (!ingrediente || ingrediente.precio === null || item.unidad !== ingrediente.unidadBase) return null
  return Math.round((ingrediente.precio * item.cantidad) / ingrediente.porCantidad)
}

export function costoProvisional(receta: Receta, catalogo: ReadonlyMap<string, Ingrediente>): CostoReceta {
  const lineas = receta.ingredientes.map((item) => {
    const ingrediente = catalogo.get(item.ingrediente)
    return { item, ingrediente, subtotal: subtotal(item, ingrediente) }
  })
  const conPrecio = lineas.filter((l) => l.subtotal !== null)
  const total = conPrecio.reduce((suma, l) => suma + (l.subtotal ?? 0), 0)
  const porciones = receta.porcionesBase
  const fechas = conPrecio.map((l) => l.ingrediente?.fechaPrecio ?? '').filter(Boolean).sort()

  return {
    lineas,
    total,
    minimo: Math.round(total * (1 - RANGO)),
    maximo: Math.round(total * (1 + RANGO)),
    porPorcion: Math.round(total / porciones),
    porPorcionMinimo: Math.round((total * (1 - RANGO)) / porciones),
    porPorcionMaximo: Math.round((total * (1 + RANGO)) / porciones),
    sinPrecio: lineas.filter((l) => l.subtotal === null).map((l) => l.ingrediente?.nombre ?? l.item.ingrediente),
    fechaPrecio: fechas[0] ?? null,
  }
}
