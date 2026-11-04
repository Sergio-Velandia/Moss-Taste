import type { Ingrediente, IngredienteReceta } from './tipos'

/**
 * Lo que puede reemplazar a un ingrediente, sin sumarse al costo: «o pan tostado».
 * Vive en el catálogo. Una receta solo la escribe si depende de su cantidad: «o 150 g de azúcar».
 */
export function alternativaDe(item: IngredienteReceta, ingrediente: Ingrediente | undefined): string | undefined {
  return item.alternativa ?? (ingrediente?.alternativa ? `o ${ingrediente.alternativa}` : undefined)
}
