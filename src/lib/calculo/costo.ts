import type { Ingrediente, IngredienteReceta, Receta } from '@/lib/recetas/tipos'
import { escalar } from './escalar'
import { cantidadACompra } from './merma'
import { convertir } from './unidades'

/*
 * Cerebro de cálculo: escala la receta a las porciones pedidas, convierte cada cantidad a la unidad
 * del catálogo, suma la merma y calcula el costo de lo que se compra.
 * El dinero siempre es entero en COP: cada línea se redondea al peso y el total es la suma de las
 * líneas, así lo que se muestra cuadra. Nunca se asume cero: si algo no se puede calcular, se dice por qué.
 */

export const RANGO_COSTO = 0.1

export type MotivoSinPrecio = 'sin-ingrediente' | 'sin-precio' | 'sin-conversion'

export interface LineaCalculada {
  item: IngredienteReceta
  ingrediente: Ingrediente | undefined
  /** Cantidad escalada, en la unidad de la receta. */
  cantidad: number
  /** Lo que se usa, en la unidad base del catálogo. null si no se puede convertir. */
  uso: number | null
  /** Lo que se compra (uso + merma), en la unidad base del catálogo. */
  compra: number | null
  /** COP entero, o null si no se puede calcular. */
  subtotal: number | null
  motivo?: MotivoSinPrecio
}

export interface CalculoReceta {
  porciones: number
  lineas: LineaCalculada[]
  total: number
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

/** Costo en COP entero de una cantidad en la unidad base del catálogo. */
export function costoDe(ingrediente: Ingrediente, cantidadBase: number): number | null {
  if (ingrediente.precio === null) return null
  return Math.round((ingrediente.precio * cantidadBase) / ingrediente.porCantidad)
}

export function calcularLinea(item: IngredienteReceta, ingrediente: Ingrediente | undefined, porcionesBase: number, porciones: number): LineaCalculada {
  const cantidad = escalar(item.cantidad, porcionesBase, porciones)
  if (!ingrediente) return { item, ingrediente, cantidad, uso: null, compra: null, subtotal: null, motivo: 'sin-ingrediente' }
  const uso = convertir(cantidad, item.unidad, ingrediente.unidadBase, ingrediente)
  if (uso === null) return { item, ingrediente, cantidad, uso, compra: null, subtotal: null, motivo: 'sin-conversion' }
  const compra = cantidadACompra(uso, ingrediente.merma)
  const subtotal = costoDe(ingrediente, compra)
  return subtotal === null ? { item, ingrediente, cantidad, uso, compra, subtotal, motivo: 'sin-precio' } : { item, ingrediente, cantidad, uso, compra, subtotal }
}

export function calcularReceta(receta: Receta, porciones: number, catalogo: ReadonlyMap<string, Ingrediente>): CalculoReceta {
  const lineas = receta.ingredientes.map((item) => calcularLinea(item, catalogo.get(item.ingrediente), receta.porcionesBase, porciones))
  const conPrecio = lineas.filter((l) => l.subtotal !== null)
  const total = conPrecio.reduce((suma, l) => suma + (l.subtotal ?? 0), 0)
  const fechas = conPrecio.flatMap((l) => (l.ingrediente ? [l.ingrediente.fechaPrecio] : [])).sort()

  return {
    porciones,
    lineas,
    total,
    minimo: Math.round(total * (1 - RANGO_COSTO)),
    maximo: Math.round(total * (1 + RANGO_COSTO)),
    porPorcion: Math.round(total / porciones),
    porPorcionMinimo: Math.round((total * (1 - RANGO_COSTO)) / porciones),
    porPorcionMaximo: Math.round((total * (1 + RANGO_COSTO)) / porciones),
    sinPrecio: lineas.filter((l) => l.subtotal === null).map((l) => l.ingrediente?.nombre ?? l.item.ingrediente),
    fechaPrecio: fechas[0] ?? null,
  }
}
