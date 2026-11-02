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
  /** Fecha del precio, AAAA-MM-DD. Obligatoria salvo en los ingredientes que no se costean. */
  fechaPrecio?: string
  /** Fracción que se pierde al limpiar o pelar (0 a <1). La aplica src/lib/calculo/merma.ts. */
  merma: number
  /** g/ml, para convertir volumen a peso. */
  densidad?: number
  /** Gramos de una unidad (una mazorca, un huevo), para convertir unidades a peso. */
  gramosPorUnidad?: number
  /** Cómo se dice «unidad» para este ingrediente en una receta: { singular: 'diente', plural: 'dientes' }. */
  unidadNombre?: { singular: string; plural: string }
  /** El agua de la llave o la sal: se usan pero no se cuentan en el costo. Su precio va en null. */
  noSeCostea?: boolean
  ejemplo?: boolean
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string
  /** Slug de la receta cuya imagen representa la categoría en las recetas que no tienen foto. */
  imagenRespaldo?: string
}

export interface IngredienteReceta {
  ingrediente: string
  cantidad: number
  unidad: Unidad
  /** No escala de forma lineal (sal, especias): se ajusta al gusto. */
  ajustarAlGusto?: boolean
  /** Se puede omitir (el queso de la changua). Suma al costo, y la ficha lo marca para restarlo de un vistazo. */
  opcional?: boolean
  /** Otra opción que lo reemplaza, sin sumarse: «o pan tostado». Solo cuenta el ingrediente principal. */
  alternativa?: string
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
  /** Descripción de imagen.webp para quien no la ve. Obligatoria si la receta tiene imagen. */
  imagenAlt?: string
  /** Consejos de la casa: por qué se hace así, cómo corregir si algo sale distinto. */
  notas?: string[]
  /** Receta ficticia de la Fase 1: se marca visiblemente como ejemplo. */
  ejemplo?: boolean
}
