// Modelo de datos del recetario. Las recetas personales (Fase 6) tendrán la misma forma.

// Primero las estándar (las que se ofrecen por defecto); al final, las adicionales de la cocina colombiana.
export const UNIDADES = ['g', 'kg', 'ml', 'l', 'taza', 'cucharada', 'cucharadita', 'unidad', 'libra', 'pizca'] as const
export type Unidad = (typeof UNIDADES)[number]

export const UNIDADES_BASE = ['g', 'ml', 'unidad'] as const
export type UnidadBase = (typeof UNIDADES_BASE)[number]

/** Ingrediente del catálogo (src/data/ingredientes.json). Las recetas lo referencian por id. */
export interface Ingrediente {
  id: string
  nombre: string
  unidadBase: UnidadBase
  /** Precio en COP entero por `porCantidad` de la unidad base. null = sin precio (se dice, no se asume cero). */
  precio: number | null
  porCantidad: number
  /** Fecha del precio, AAAA-MM-DD. */
  fechaPrecio: string
  /** Fracción que se pierde al limpiar o pelar (0 a <1). La aplica src/lib/calculo/merma.ts. */
  merma: number
  /** g/ml, para convertir volumen a peso. */
  densidad?: number
  /** Gramos de una unidad (una mazorca, un huevo), para convertir unidades a peso. */
  gramosPorUnidad?: number
  /** Nombre de la unidad cuando la unidad base es «unidad»: { singular: 'diente', plural: 'dientes' }. */
  unidadNombre?: { singular: string; plural: string }
  ejemplo?: boolean
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string
}

export interface IngredienteReceta {
  ingrediente: string
  cantidad: number
  unidad: Unidad
  /** No escala de forma lineal (sal, especias): se ajusta al gusto. */
  ajustarAlGusto?: boolean
  nota?: string
}

export interface Paso {
  texto: string
  /** Ids de los ingredientes que usa este paso (para el modo cocina). */
  ingredientes?: string[]
  temporizadorMin?: number
}

export interface Receta {
  id: string
  titulo: string
  resumen: string
  categoria: string
  porcionesBase: number
  tiempoMin: number
  ingredientes: IngredienteReceta[]
  miseEnPlace: string[]
  pasos: Paso[]
  /** Receta ficticia de la Fase 1: se marca visiblemente como ejemplo. */
  ejemplo?: boolean
}
