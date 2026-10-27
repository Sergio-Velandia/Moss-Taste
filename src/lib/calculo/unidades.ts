import type { Ingrediente, Unidad, UnidadBase } from '@/lib/recetas/tipos'

// Conversión de unidades. Puro y sin React. Si no hay forma honesta de convertir, devuelve null
// (por ejemplo, gramos de algo que se vende por unidad y del que no se sabe cuánto pesa una).

export type Dimension = 'masa' | 'volumen' | 'conteo'

/** Cada unidad en gramos, mililitros o unidades. Medidas estándar de cocina. */
export const EQUIVALENCIAS: Record<Unidad, { dimension: Dimension; factor: number }> = {
  g: { dimension: 'masa', factor: 1 },
  kg: { dimension: 'masa', factor: 1000 },
  /** Libra colombiana: 500 g. */
  libra: { dimension: 'masa', factor: 500 },
  ml: { dimension: 'volumen', factor: 1 },
  l: { dimension: 'volumen', factor: 1000 },
  taza: { dimension: 'volumen', factor: 240 },
  cucharada: { dimension: 'volumen', factor: 15 },
  cucharadita: { dimension: 'volumen', factor: 5 },
  /** Un dieciseisavo de cucharadita. */
  pizca: { dimension: 'volumen', factor: 5 / 16 },
  unidad: { dimension: 'conteo', factor: 1 },
}

const DIMENSION_BASE: Record<UnidadBase, Dimension> = { g: 'masa', ml: 'volumen', unidad: 'conteo' }

type DatosConversion = Pick<Ingrediente, 'densidad' | 'gramosPorUnidad'>

/** Pasa una cantidad de cualquier dimensión a gramos, si se puede. */
function aGramos(valor: number, dimension: Dimension, { densidad, gramosPorUnidad }: DatosConversion): number | null {
  if (dimension === 'masa') return valor
  if (dimension === 'volumen') return densidad ? valor * densidad : null
  return gramosPorUnidad ? valor * gramosPorUnidad : null
}

/** Pasa gramos a la dimensión pedida, si se puede. */
function desdeGramos(gramos: number, dimension: Dimension, { densidad, gramosPorUnidad }: DatosConversion): number | null {
  if (dimension === 'masa') return gramos
  if (dimension === 'volumen') return densidad ? gramos / densidad : null
  return gramosPorUnidad ? gramos / gramosPorUnidad : null
}

/**
 * Convierte `cantidad` de `desde` a la unidad base del catálogo (`a`).
 * Dentro de la misma dimensión siempre se puede; entre dimensiones pasa por gramos usando
 * la densidad (volumen) o el peso por unidad (conteo) del ingrediente.
 */
export function convertir(cantidad: number, desde: Unidad, a: UnidadBase, ingrediente: DatosConversion = {}): number | null {
  const { dimension, factor } = EQUIVALENCIAS[desde]
  const valor = cantidad * factor
  const destino = DIMENSION_BASE[a]
  if (dimension === destino) return valor
  const gramos = aGramos(valor, dimension, ingrediente)
  return gramos === null ? null : desdeGramos(gramos, destino, ingrediente)
}
