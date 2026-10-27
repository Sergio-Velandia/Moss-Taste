import type { Unidad } from '@/lib/recetas/tipos'

// Redondeo para MOSTRAR cantidades como se miden en la cocina. El costo siempre usa la cantidad exacta.
// Nunca redondea a cero algo que la receta pide: el mínimo es el paso más pequeño de la unidad.

export interface CantidadMostrada {
  valor: number
  unidad: Unidad
}

const redondearA = (n: number, paso: number) => Math.round(n / paso) * paso
const conMinimo = (n: number, paso: number) => (n > 0 ? Math.max(paso, redondearA(n, paso)) : 0)

/** Gramos o mililitros: medio en lo muy pequeño, entero bajo 100, de 5 en 5 hasta mil; desde mil, en kg o l. */
function metrico(base: number, chica: 'g' | 'ml', grande: 'kg' | 'l'): CantidadMostrada {
  if (base >= 1000) return { valor: redondearA(base / 1000, 0.05), unidad: grande }
  if (base < 10) return { valor: conMinimo(base, 0.5), unidad: chica }
  if (base < 100) return { valor: Math.round(base), unidad: chica }
  const valor = redondearA(base, 5)
  return valor >= 1000 ? { valor: 1, unidad: grande } : { valor, unidad: chica }
}

/** Paso de las medidas que se cuentan o se miden con taza y cuchara. */
const PASOS: Partial<Record<Unidad, number>> = { taza: 0.25, cucharada: 0.5, cucharadita: 0.25, libra: 0.25, unidad: 0.5, pizca: 1 }

export function redondearCocina(cantidad: number, unidad: Unidad): CantidadMostrada {
  switch (unidad) {
    case 'g':
      return metrico(cantidad, 'g', 'kg')
    case 'kg':
      return metrico(cantidad * 1000, 'g', 'kg')
    case 'ml':
      return metrico(cantidad, 'ml', 'l')
    case 'l':
      return metrico(cantidad * 1000, 'ml', 'l')
    default:
      return { valor: conMinimo(cantidad, PASOS[unidad] ?? 0.25), unidad }
  }
}

const FRACCIONES: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' }

/** 1.5 → «1½», 0.25 → «¼», 2,5 g → «2,5». Las medidas de cocina usan fracciones; el sistema métrico, decimales. */
export function numeroCocina(valor: number, unidad: Unidad): string {
  if (unidad === 'g' || unidad === 'ml' || unidad === 'kg' || unidad === 'l') {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(valor)
  }
  const entero = Math.floor(valor)
  const fraccion = FRACCIONES[Math.round((valor - entero) * 100) / 100]
  if (!fraccion) return String(Math.round(valor))
  return entero ? `${entero}${fraccion}` : fraccion
}
