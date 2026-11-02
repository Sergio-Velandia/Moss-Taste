import { formatoCantidad } from '@/lib/formato'
import type { Ingrediente } from '@/lib/recetas/tipos'

/*
 * Cuánto se compra en la tienda y cuánto se paga en caja. Es distinto del costo de la receta:
 *   - la receta cuesta lo que se usa (proporcional),
 *   - en caja se paga el empaque completo: 60 g de alcaparras se compran en un frasco de 100 g.
 * Los dos números se muestran por separado y nunca se mezclan.
 */

export interface Compra {
  /** «1 frasco de 100 g», «3 mazorcas»; null si se compra suelto por peso (se paga lo que se pesa). */
  descripcion: string | null
  /** COP entero que se paga en caja, o null si el ingrediente no tiene precio o no se costea. */
  costoCaja: number | null
}

// Evita que 30,0000001 huevos se conviertan en dos panales por el redondeo de punto flotante.
const EPSILON = 1e-9
const hacia = (n: number) => Math.max(1, Math.ceil(n - EPSILON))

/** `cantidadBase`: lo que hay que comprar (con merma) en la unidad base del catálogo. */
export function compraEnTienda(ingrediente: Ingrediente, cantidadBase: number): Compra {
  const { precio, porCantidad, empaque, unidadBase, noSeCostea } = ingrediente
  const conPrecio = precio !== null && !noSeCostea

  if (empaque) {
    const n = hacia(cantidadBase / porCantidad)
    const tamano = formatoCantidad({ cantidad: porCantidad, unidad: unidadBase }, ingrediente)
    return {
      descripcion: `${n} ${n === 1 ? empaque.singular : empaque.plural} de ${tamano}`,
      costoCaja: conPrecio ? n * precio : null,
    }
  }

  if (unidadBase === 'unidad') {
    const n = hacia(cantidadBase)
    return {
      descripcion: formatoCantidad({ cantidad: n, unidad: 'unidad' }, ingrediente),
      costoCaja: conPrecio ? Math.round((precio * n) / porCantidad) : null,
    }
  }

  // Suelto por peso o volumen: se paga lo que marca la báscula.
  return { descripcion: null, costoCaja: conPrecio ? Math.round((precio * cantidadBase) / porCantidad) : null }
}
